package salary

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct{ db *pgxpool.Pool }

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db} }

func (r *Repository) Options(ctx context.Context) (Options, error) {
	result := Options{
		WorkModes: []Option{{Name: "On-site", Slug: "on_site"}, {Name: "Hybrid", Slug: "hybrid"}, {Name: "Remote", Slug: "remote"}},
		Periods:   []Option{{Name: "Monthly", Slug: "monthly"}, {Name: "Annual", Slug: "annual"}},
	}
	rows, err := r.db.Query(ctx, `SELECT canonical_role, role_slug FROM salary_role_aliases WHERE is_active GROUP BY canonical_role, role_slug ORDER BY canonical_role`)
	if err != nil {
		return result, err
	}
	for rows.Next() {
		var item Option
		if err := rows.Scan(&item.Name, &item.Slug); err != nil {
			rows.Close()
			return result, err
		}
		result.Roles = append(result.Roles, item)
	}
	rows.Close()
	rows, err = r.db.Query(ctx, `SELECT name, slug FROM salary_locations WHERE is_active ORDER BY CASE geography_level WHEN 'city' THEN 1 WHEN 'remote' THEN 2 ELSE 3 END, name`)
	if err != nil {
		return result, err
	}
	defer rows.Close()
	for rows.Next() {
		var item Option
		if err := rows.Scan(&item.Name, &item.Slug); err != nil {
			return result, err
		}
		result.Locations = append(result.Locations, item)
	}
	return result, rows.Err()
}

func (r *Repository) Resolve(ctx context.Context, role, city string, experience float64, workMode, education, shift string) (Benchmark, error) {
	var canonical, roleSlug string
	err := r.db.QueryRow(ctx, `SELECT canonical_role, role_slug FROM salary_role_aliases WHERE is_active AND (role_slug=$1 OR lower(alias)=lower($2) OR lower(canonical_role)=lower($2)) ORDER BY CASE WHEN role_slug=$1 THEN 0 ELSE 1 END LIMIT 1`, slug(role), role).Scan(&canonical, &roleSlug)
	if errors.Is(err, pgx.ErrNoRows) {
		return Benchmark{}, pgx.ErrNoRows
	}
	if err != nil {
		return Benchmark{}, err
	}

	benchmark, err := r.reviewedBenchmark(ctx, canonical, roleSlug, city, experience, workMode, education, shift)
	if err == nil {
		benchmark.ComparableCities, _ = r.comparableCities(ctx, roleSlug, benchmark.Geography)
		return benchmark, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return Benchmark{}, err
	}
	benchmark, err = r.firstPartyBenchmark(ctx, canonical, roleSlug, city, experience, workMode)
	if err == nil {
		benchmark.ComparableCities, _ = r.comparableCities(ctx, roleSlug, benchmark.Geography)
	}
	return benchmark, err
}

func (r *Repository) reviewedBenchmark(ctx context.Context, canonical, roleSlug, city string, experience float64, workMode, education, shift string) (Benchmark, error) {
	var item Benchmark
	var publishedOn, reviewedAt *time.Time
	err := r.db.QueryRow(ctx, `
		SELECT b.canonical_role,b.role_slug,b.geography_name,b.geography_level,b.p25_annual,b.median_annual,b.p75_annual,b.mean_annual,b.sample_size,b.effective_date,b.confidence,b.salary_basis,
		s.name,s.publisher,s.source_url,s.published_on,s.methodology_notes,s.last_reviewed_at
		FROM salary_benchmarks b JOIN salary_sources s ON s.id=b.source_id
		WHERE b.is_published AND b.role_slug=$1 AND b.experience_min <= $2 AND (b.experience_max IS NULL OR b.experience_max >= $2)
		AND (lower(b.geography_name)=lower($3) OR b.geography_level='national')
		AND (b.work_mode IS NULL OR b.work_mode=NULLIF($4,''))
		AND (b.education IS NULL OR lower(b.education)=lower(NULLIF($5,'')))
		AND (b.shift IS NULL OR lower(b.shift)=lower(NULLIF($6,'')))
		ORDER BY CASE WHEN lower(b.geography_name)=lower($3) THEN 0 ELSE 1 END,
		CASE WHEN b.work_mode IS NOT NULL THEN 0 ELSE 1 END, b.effective_date DESC LIMIT 1
	`, roleSlug, experience, city, workMode, education, shift).Scan(
		&item.Role, &item.RoleSlug, &item.Geography, &item.GeographyLevel, &item.P25Annual, &item.MedianAnnual, &item.P75Annual, &item.MeanAnnual, &item.SampleSize, &item.EffectiveDate, &item.Confidence, &item.SalaryBasis,
		&item.Source.Name, &item.Source.Publisher, &item.Source.URL, &publishedOn, &item.Source.Methodology, &reviewedAt)
	item.Source.PublishedOn, item.Source.LastReviewed = publishedOn, reviewedAt
	if item.Role == "" {
		item.Role = canonical
	}
	return item, err
}

func (r *Repository) firstPartyBenchmark(ctx context.Context, canonical, roleSlug, city string, experience float64, workMode string) (Benchmark, error) {
	var item Benchmark
	var p25, median, p75, mean *float64
	var count int
	var effective *time.Time
	periodExpr := `CASE j.salary_period WHEN 'hourly' THEN 8*26*12 WHEN 'daily' THEN 26*12 WHEN 'monthly' THEN 12 ELSE 1 END`
	err := r.db.QueryRow(ctx, `
		WITH matching AS (
			SELECT ((j.salary_min+j.salary_max)/2.0)*`+periodExpr+` AS annual, j.updated_at
			FROM jobs j
			WHERE j.status='published' AND j.visibility='public' AND j.deleted_at IS NULL AND j.currency='INR'
			AND j.salary_min > 0 AND j.salary_max >= j.salary_min
			AND (lower(j.title) LIKE ANY(SELECT '%'||lower(alias)||'%' FROM salary_role_aliases WHERE role_slug=$1))
			AND (lower(j.city)=lower($2) OR ($2='India'))
			AND ($3='' OR j.work_mode=$3)
			AND j.experience_min <= $4 AND (j.experience_max IS NULL OR j.experience_max >= $4)
			AND ((j.salary_max*`+periodExpr+`) BETWEEN 60000 AND 50000000)
		)
		SELECT percentile_cont(.25) WITHIN GROUP (ORDER BY annual), percentile_cont(.5) WITHIN GROUP (ORDER BY annual),
		percentile_cont(.75) WITHIN GROUP (ORDER BY annual), avg(annual), count(*), max(updated_at) FROM matching
	`, roleSlug, city, workMode, experience).Scan(&p25, &median, &p75, &mean, &count, &effective)
	if err != nil {
		return item, err
	}
	if count < 3 {
		return item, pgx.ErrNoRows
	}
	if effective == nil {
		return item, pgx.ErrNoRows
	}
	item = Benchmark{Role: canonical, RoleSlug: roleSlug, Geography: city, GeographyLevel: "city", P25Annual: p25, MedianAnnual: median, P75Annual: p75, MeanAnnual: mean, SampleSize: &count, EffectiveDate: *effective, Confidence: confidence(count), SalaryBasis: "reported", Source: Source{Name: "Jobs View Published Jobs", Publisher: "Jobs View", URL: "https://jobsview.in/jobs", Methodology: "Aggregated from active public jobs with disclosed INR salary ranges and valid pay periods."}}
	if strings.EqualFold(city, "India") {
		item.GeographyLevel = "national"
	}
	return item, nil
}

func (r *Repository) comparableCities(ctx context.Context, roleSlug, exclude string) ([]Option, error) {
	rows, err := r.db.Query(ctx, `SELECT DISTINCT geography_name, lower(replace(geography_name,' ','-')) FROM salary_benchmarks WHERE is_published AND role_slug=$1 AND geography_level='city' AND geography_name<>$2 ORDER BY geography_name LIMIT 5`, roleSlug, exclude)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Option{}
	for rows.Next() {
		var item Option
		if err := rows.Scan(&item.Name, &item.Slug); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func slug(value string) string {
	return strings.Trim(strings.NewReplacer(" ", "-", "/", "-", "_", "-").Replace(strings.ToLower(strings.TrimSpace(value))), "-")
}
func confidence(sample int) string {
	if sample >= 30 {
		return "high"
	}
	if sample >= 10 {
		return "medium"
	}
	return "low"
}

func annualizeSalary(value float64, period string) (float64, bool) {
	switch period {
	case "hourly":
		return value * 8 * 26 * 12, true
	case "daily":
		return value * 26 * 12, true
	case "monthly":
		return value * 12, true
	case "annual":
		return value, true
	default:
		return 0, false
	}
}
