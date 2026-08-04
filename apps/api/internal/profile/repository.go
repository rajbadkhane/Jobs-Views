package profile

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"time"

	"careeros/api/internal/auth"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CandidateByUserID(ctx context.Context, userID uuid.UUID) (CandidateProfile, error) {
	var item CandidateProfile
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, first_name, last_name, coalesce(title, ''), coalesce(headline, ''), coalesce(bio, ''),
		       coalesce(phone, ''), coalesce(location, ''), coalesce(availability, ''), coalesce(avatar_url, ''),
		       coalesce(resume_url, ''), visibility, completed_score, profile_strength, created_at, updated_at
		FROM candidate_profiles
		WHERE user_id = $1 AND deleted_at IS NULL
	`, userID).Scan(&item.ID, &item.UserID, &item.FirstName, &item.LastName, &item.Title, &item.Headline, &item.Bio, &item.Phone, &item.Location, &item.Availability, &item.AvatarURL, &item.ResumeURL, &item.Visibility, &item.CompletedScore, &item.ProfileStrength, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return CandidateProfile{}, auth.ErrNotFound
	}
	return item, err
}

func (r *Repository) UpsertCandidate(ctx context.Context, userID uuid.UUID, req CandidateProfileRequest, completion Completion) (CandidateProfile, error) {
	visibility := req.Visibility
	if visibility == "" {
		visibility = "public"
	}
	_, err := r.db.Exec(ctx, `
		INSERT INTO candidate_profiles (user_id, first_name, last_name, title, headline, bio, phone, location, availability, visibility, completed_score, profile_strength)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (user_id) DO UPDATE SET
			first_name = EXCLUDED.first_name,
			last_name = EXCLUDED.last_name,
			title = EXCLUDED.title,
			headline = EXCLUDED.headline,
			bio = EXCLUDED.bio,
			phone = EXCLUDED.phone,
			location = EXCLUDED.location,
			availability = EXCLUDED.availability,
			visibility = EXCLUDED.visibility,
			completed_score = EXCLUDED.completed_score,
			profile_strength = EXCLUDED.profile_strength
	`, userID, req.FirstName, req.LastName, req.Title, req.Headline, req.Bio, req.Phone, req.Location, req.Availability, visibility, completion.Score, completion.Strength)
	if err != nil {
		return CandidateProfile{}, err
	}
	return r.CandidateByUserID(ctx, userID)
}

func (r *Repository) EmployerByUserID(ctx context.Context, userID uuid.UUID) (EmployerProfile, error) {
	var item EmployerProfile
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, company_id, first_name, last_name, coalesce(title, ''), coalesce(phone, ''),
		       coalesce(avatar_url, ''), completed_score, profile_strength, created_at, updated_at
		FROM employer_profiles
		WHERE user_id = $1 AND deleted_at IS NULL
	`, userID).Scan(&item.ID, &item.UserID, &item.CompanyID, &item.FirstName, &item.LastName, &item.Title, &item.Phone, &item.AvatarURL, &item.CompletedScore, &item.ProfileStrength, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return EmployerProfile{}, auth.ErrNotFound
	}
	return item, err
}

func (r *Repository) UpsertEmployer(ctx context.Context, userID uuid.UUID, req EmployerProfileRequest, completion Completion) (EmployerProfile, error) {
	_, err := r.db.Exec(ctx, `
		INSERT INTO employer_profiles (user_id, first_name, last_name, title, phone, completed_score, profile_strength)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (user_id) DO UPDATE SET
			first_name = EXCLUDED.first_name,
			last_name = EXCLUDED.last_name,
			title = EXCLUDED.title,
			phone = EXCLUDED.phone,
			completed_score = EXCLUDED.completed_score,
			profile_strength = EXCLUDED.profile_strength
	`, userID, req.FirstName, req.LastName, req.Title, req.Phone, completion.Score, completion.Strength)
	if err != nil {
		return EmployerProfile{}, err
	}
	return r.EmployerByUserID(ctx, userID)
}

func (r *Repository) AdminByUserID(ctx context.Context, userID uuid.UUID) (AdminProfile, error) {
	var item AdminProfile
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, first_name, last_name, coalesce(title, ''), coalesce(avatar_url, ''),
		       completed_score, profile_strength, created_at, updated_at
		FROM admin_profiles
		WHERE user_id = $1 AND deleted_at IS NULL
	`, userID).Scan(&item.ID, &item.UserID, &item.FirstName, &item.LastName, &item.Title, &item.AvatarURL, &item.CompletedScore, &item.ProfileStrength, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return AdminProfile{}, auth.ErrNotFound
	}
	return item, err
}

func (r *Repository) UpsertAdmin(ctx context.Context, userID uuid.UUID, req AdminProfileRequest, completion Completion) (AdminProfile, error) {
	_, err := r.db.Exec(ctx, `
		INSERT INTO admin_profiles (user_id, first_name, last_name, title, completed_score, profile_strength)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id) DO UPDATE SET
			first_name = EXCLUDED.first_name,
			last_name = EXCLUDED.last_name,
			title = EXCLUDED.title,
			completed_score = EXCLUDED.completed_score,
			profile_strength = EXCLUDED.profile_strength
	`, userID, req.FirstName, req.LastName, req.Title, completion.Score, completion.Strength)
	if err != nil {
		return AdminProfile{}, err
	}
	return r.AdminByUserID(ctx, userID)
}

func (r *Repository) PublicCandidate(ctx context.Context, id uuid.UUID) (CandidateProfile, error) {
	var item CandidateProfile
	err := r.db.QueryRow(ctx, `
		SELECT id, user_id, first_name, last_name, coalesce(title, ''), coalesce(headline, ''), coalesce(bio, ''),
		       coalesce(phone, ''), coalesce(location, ''), coalesce(availability, ''), coalesce(avatar_url, ''),
		       coalesce(resume_url, ''), visibility, completed_score, profile_strength, created_at, updated_at
		FROM candidate_profiles
		WHERE id = $1 AND visibility = 'public' AND deleted_at IS NULL
	`, id).Scan(&item.ID, &item.UserID, &item.FirstName, &item.LastName, &item.Title, &item.Headline, &item.Bio, &item.Phone, &item.Location, &item.Availability, &item.AvatarURL, &item.ResumeURL, &item.Visibility, &item.CompletedScore, &item.ProfileStrength, &item.CreatedAt, &item.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return CandidateProfile{}, auth.ErrNotFound
	}
	return item, err
}

func (r *Repository) SearchCandidates(ctx context.Context, query, location, skill string, limit int) ([]CandidateProfile, error) {
	args := []any{}
	where := []string{"cp.visibility = 'public'", "cp.deleted_at IS NULL"}
	if query != "" {
		args = append(args, "%"+strings.ToLower(query)+"%")
		where = append(where, "(lower(cp.first_name || ' ' || cp.last_name || ' ' || coalesce(cp.title, '') || ' ' || coalesce(cp.bio, '')) LIKE $"+strconv.Itoa(len(args))+")")
	}
	if location != "" {
		args = append(args, "%"+strings.ToLower(location)+"%")
		where = append(where, "lower(coalesce(cp.location, '')) LIKE $"+strconv.Itoa(len(args)))
	}
	if skill != "" {
		args = append(args, "%"+strings.ToLower(skill)+"%")
		where = append(where, "EXISTS (SELECT 1 FROM candidate_skills cs WHERE cs.candidate_profile_id = cp.id AND lower(cs.name) LIKE $"+strconv.Itoa(len(args))+")")
	}
	args = append(args, limit)
	sql := `
		SELECT cp.id, cp.user_id, cp.first_name, cp.last_name, coalesce(cp.title, ''), coalesce(cp.headline, ''), coalesce(cp.bio, ''),
		       coalesce(cp.phone, ''), coalesce(cp.location, ''), coalesce(cp.availability, ''), coalesce(cp.avatar_url, ''),
		       coalesce(cp.resume_url, ''), cp.visibility, cp.completed_score, cp.profile_strength, cp.created_at, cp.updated_at
		FROM candidate_profiles cp
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY cp.completed_score DESC, cp.updated_at DESC
		LIMIT $` + strconv.Itoa(len(args))
	rows, err := r.db.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []CandidateProfile{}
	for rows.Next() {
		var item CandidateProfile
		if err := rows.Scan(&item.ID, &item.UserID, &item.FirstName, &item.LastName, &item.Title, &item.Headline, &item.Bio, &item.Phone, &item.Location, &item.Availability, &item.AvatarURL, &item.ResumeURL, &item.Visibility, &item.CompletedScore, &item.ProfileStrength, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) SoftDeleteProfile(ctx context.Context, userID uuid.UUID, role string) error {
	table := profileTable(role)
	_, err := r.db.Exec(ctx, "UPDATE "+table+" SET deleted_at = NOW() WHERE user_id = $1", userID)
	return err
}

func (r *Repository) UpdateAvatar(ctx context.Context, userID uuid.UUID, role, fileURL string) error {
	table := profileTable(role)
	_, err := r.db.Exec(ctx, "UPDATE "+table+" SET avatar_url = $1 WHERE user_id = $2", fileURL, userID)
	return err
}

func (r *Repository) CreateUpload(ctx context.Context, userID uuid.UUID, profileType, uploadType, name, url, mime string, size int64, metadata map[string]any) (UploadResult, error) {
	bytes, _ := json.Marshal(metadata)
	var result UploadResult
	err := r.db.QueryRow(ctx, `
		INSERT INTO profile_uploads (user_id, profile_type, upload_type, file_name, file_url, mime_type, file_size, metadata)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, file_name, file_url, mime_type, file_size, virus_scan_status
	`, userID, profileType, uploadType, name, url, mime, size, bytes).Scan(&result.ID, &result.FileName, &result.FileURL, &result.MimeType, &result.FileSize, &result.VirusScanStatus)
	return result, err
}

func (r *Repository) CreateResume(ctx context.Context, userID uuid.UUID, upload UploadResult) error {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(ctx, `
		INSERT INTO resumes (candidate_profile_id, upload_id, file_name, file_url, mime_type, file_size)
		VALUES ($1, $2, $3, $4, $5, $6);
		UPDATE candidate_profiles SET resume_url = $4 WHERE id = $1;
	`, profile.ID, upload.ID, upload.FileName, upload.FileURL, upload.MimeType, upload.FileSize)
	return err
}

func (r *Repository) Skills(ctx context.Context, userID uuid.UUID) ([]Skill, error) {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	rows, err := r.db.Query(ctx, `
		SELECT cs.id, cs.name, coalesce(sc.name, ''), cs.level, cs.years_experience, cs.created_at, cs.updated_at
		FROM candidate_skills cs
		LEFT JOIN skills s ON s.id = cs.skill_id
		LEFT JOIN skill_categories sc ON sc.id = s.category_id
		WHERE cs.candidate_profile_id = $1
		ORDER BY cs.years_experience DESC, cs.name
	`, profile.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Skill{}
	for rows.Next() {
		var item Skill
		if err := rows.Scan(&item.ID, &item.Name, &item.Category, &item.Level, &item.YearsExperience, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) UpsertSkill(ctx context.Context, userID uuid.UUID, req SkillRequest) (Skill, error) {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return Skill{}, err
	}
	var item Skill
	err = r.db.QueryRow(ctx, `
		INSERT INTO candidate_skills (candidate_profile_id, name, level, years_experience)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (candidate_profile_id, name) DO UPDATE SET level = EXCLUDED.level, years_experience = EXCLUDED.years_experience
		RETURNING id, name, '', level, years_experience, created_at, updated_at
	`, profile.ID, req.Name, req.Level, req.YearsExperience).Scan(&item.ID, &item.Name, &item.Category, &item.Level, &item.YearsExperience, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (r *Repository) DeleteSkill(ctx context.Context, userID, id uuid.UUID) error {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(ctx, `DELETE FROM candidate_skills WHERE id = $1 AND candidate_profile_id = $2`, id, profile.ID)
	return err
}

func (r *Repository) Education(ctx context.Context, userID uuid.UUID) ([]Education, error) {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	rows, err := r.db.Query(ctx, `
		SELECT id, qualification, university, coalesce(field_of_study, ''), coalesce(certificate_url, ''), coalesce(start_year, 0), coalesce(end_year, 0), coalesce(grade, ''), created_at, updated_at
		FROM candidate_education WHERE candidate_profile_id = $1 ORDER BY coalesce(end_year, 9999) DESC
	`, profile.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Education{}
	for rows.Next() {
		var item Education
		if err := rows.Scan(&item.ID, &item.Qualification, &item.University, &item.FieldOfStudy, &item.CertificateURL, &item.StartYear, &item.EndYear, &item.Grade, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) CreateEducation(ctx context.Context, userID uuid.UUID, req EducationRequest) (Education, error) {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return Education{}, err
	}
	var item Education
	err = r.db.QueryRow(ctx, `
		INSERT INTO candidate_education (candidate_profile_id, qualification, university, field_of_study, certificate_url, start_year, end_year, grade)
		VALUES ($1, $2, $3, $4, $5, NULLIF($6, 0), NULLIF($7, 0), $8)
		RETURNING id, qualification, university, coalesce(field_of_study, ''), coalesce(certificate_url, ''), coalesce(start_year, 0), coalesce(end_year, 0), coalesce(grade, ''), created_at, updated_at
	`, profile.ID, req.Qualification, req.University, req.FieldOfStudy, req.CertificateURL, req.StartYear, req.EndYear, req.Grade).Scan(&item.ID, &item.Qualification, &item.University, &item.FieldOfStudy, &item.CertificateURL, &item.StartYear, &item.EndYear, &item.Grade, &item.CreatedAt, &item.UpdatedAt)
	return item, err
}

func (r *Repository) DeleteEducation(ctx context.Context, userID, id uuid.UUID) error {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(ctx, `DELETE FROM candidate_education WHERE id = $1 AND candidate_profile_id = $2`, id, profile.ID)
	return err
}

func (r *Repository) Experiences(ctx context.Context, userID uuid.UUID) ([]Experience, error) {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	rows, err := r.db.Query(ctx, `
		SELECT id, company_name, title, coalesce(location, ''), start_date, end_date, is_current, coalesce(description, ''), achievements, created_at, updated_at
		FROM candidate_experiences WHERE candidate_profile_id = $1 ORDER BY is_current DESC, start_date DESC
	`, profile.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Experience{}
	for rows.Next() {
		var item Experience
		var achievements []byte
		if err := rows.Scan(&item.ID, &item.CompanyName, &item.Title, &item.Location, &item.StartDate, &item.EndDate, &item.IsCurrent, &item.Description, &achievements, &item.CreatedAt, &item.UpdatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(achievements, &item.Achievements)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) CreateExperience(ctx context.Context, userID uuid.UUID, req ExperienceRequest) (Experience, error) {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return Experience{}, err
	}
	startDate := parseDate(req.StartDate)
	endDate := parseDate(req.EndDate)
	achievements, _ := json.Marshal(req.Achievements)
	var item Experience
	var rawAchievements []byte
	err = r.db.QueryRow(ctx, `
		INSERT INTO candidate_experiences (candidate_profile_id, company_name, title, location, start_date, end_date, is_current, description, achievements)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, company_name, title, coalesce(location, ''), start_date, end_date, is_current, coalesce(description, ''), achievements, created_at, updated_at
	`, profile.ID, req.CompanyName, req.Title, req.Location, startDate, endDate, req.IsCurrent, req.Description, achievements).Scan(&item.ID, &item.CompanyName, &item.Title, &item.Location, &item.StartDate, &item.EndDate, &item.IsCurrent, &item.Description, &rawAchievements, &item.CreatedAt, &item.UpdatedAt)
	_ = json.Unmarshal(rawAchievements, &item.Achievements)
	return item, err
}

func (r *Repository) DeleteExperience(ctx context.Context, userID, id uuid.UUID) error {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(ctx, `DELETE FROM candidate_experiences WHERE id = $1 AND candidate_profile_id = $2`, id, profile.ID)
	return err
}

func (r *Repository) SocialLinks(ctx context.Context, userID uuid.UUID) (SocialLinks, error) {
	var item SocialLinks
	err := r.db.QueryRow(ctx, `
		SELECT coalesce(linkedin, ''), coalesce(github, ''), coalesce(portfolio, ''), coalesce(website, ''), coalesce(twitter, '')
		FROM user_social_links WHERE user_id = $1
	`, userID).Scan(&item.LinkedIn, &item.GitHub, &item.Portfolio, &item.Website, &item.Twitter)
	if errors.Is(err, pgx.ErrNoRows) {
		return SocialLinks{}, nil
	}
	return item, err
}

func (r *Repository) UpsertSocialLinks(ctx context.Context, userID uuid.UUID, req SocialLinks) (SocialLinks, error) {
	_, err := r.db.Exec(ctx, `
		INSERT INTO user_social_links (user_id, linkedin, github, portfolio, website, twitter)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id) DO UPDATE SET linkedin = EXCLUDED.linkedin, github = EXCLUDED.github, portfolio = EXCLUDED.portfolio, website = EXCLUDED.website, twitter = EXCLUDED.twitter
	`, userID, req.LinkedIn, req.GitHub, req.Portfolio, req.Website, req.Twitter)
	if err != nil {
		return SocialLinks{}, err
	}
	return r.SocialLinks(ctx, userID)
}

func (r *Repository) Preferences(ctx context.Context, userID uuid.UUID) (NotificationPreferences, error) {
	item := NotificationPreferences{EmailEnabled: true, PushEnabled: true}
	err := r.db.QueryRow(ctx, `
		SELECT email_enabled, sms_enabled, push_enabled, marketing_enabled
		FROM notification_preferences WHERE user_id = $1
	`, userID).Scan(&item.EmailEnabled, &item.SMSEnabled, &item.PushEnabled, &item.MarketingEnabled)
	if errors.Is(err, pgx.ErrNoRows) {
		return item, nil
	}
	return item, err
}

func (r *Repository) UpsertPreferences(ctx context.Context, userID uuid.UUID, req NotificationPreferences) (NotificationPreferences, error) {
	_, err := r.db.Exec(ctx, `
		INSERT INTO notification_preferences (user_id, email_enabled, sms_enabled, push_enabled, marketing_enabled)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE SET email_enabled = EXCLUDED.email_enabled, sms_enabled = EXCLUDED.sms_enabled, push_enabled = EXCLUDED.push_enabled, marketing_enabled = EXCLUDED.marketing_enabled
	`, userID, req.EmailEnabled, req.SMSEnabled, req.PushEnabled, req.MarketingEnabled)
	if err != nil {
		return NotificationPreferences{}, err
	}
	return r.Preferences(ctx, userID)
}

func (r *Repository) Settings(ctx context.Context, userID uuid.UUID) (Settings, error) {
	item := Settings{Theme: "system", Language: "en", Timezone: "UTC", Privacy: "public"}
	err := r.db.QueryRow(ctx, `
		SELECT theme, language, timezone, privacy FROM user_settings WHERE user_id = $1
	`, userID).Scan(&item.Theme, &item.Language, &item.Timezone, &item.Privacy)
	if errors.Is(err, pgx.ErrNoRows) {
		return item, nil
	}
	return item, err
}

func (r *Repository) UpsertSettings(ctx context.Context, userID uuid.UUID, req Settings) (Settings, error) {
	_, err := r.db.Exec(ctx, `
		INSERT INTO user_settings (user_id, theme, language, timezone, privacy)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, language = EXCLUDED.language, timezone = EXCLUDED.timezone, privacy = EXCLUDED.privacy
	`, userID, req.Theme, req.Language, req.Timezone, req.Privacy)
	if err != nil {
		return Settings{}, err
	}
	return r.Settings(ctx, userID)
}

func parseDate(value string) *time.Time {
	if value == "" {
		return nil
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil
	}
	return &parsed
}

func profileTable(role string) string {
	switch role {
	case "EMPLOYER":
		return "employer_profiles"
	case "SUPER_ADMIN", "ADMIN":
		return "admin_profiles"
	default:
		return "candidate_profiles"
	}
}
