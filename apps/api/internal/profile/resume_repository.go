package profile

import (
	"context"
	"encoding/json"
	"errors"
	"strings"

	"careeros/api/internal/auth"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

func (r *Repository) ResumeBuilderAllowed(ctx context.Context, userID uuid.UUID, testEmails []string) (bool, error) {
	var email string
	if err := r.db.QueryRow(ctx, `SELECT lower(email) FROM users WHERE id=$1 AND deleted_at IS NULL`, userID).Scan(&email); err != nil {
		return false, err
	}
	for _, allowed := range testEmails {
		if strings.EqualFold(email, strings.TrimSpace(allowed)) {
			return true, nil
		}
	}
	var complete bool
	err := r.db.QueryRow(ctx, `SELECT coalesce((s.entitlements->>'resume_builder')='complete',false) FROM candidate_subscriptions s WHERE s.user_id=$1 AND s.status='active' AND s.ends_at>NOW() ORDER BY s.created_at DESC LIMIT 1`, userID).Scan(&complete)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	return complete, err
}

func (r *Repository) ResumeSeed(ctx context.Context, userID uuid.UUID) (map[string]any, error) {
	profile, err := r.CandidateByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	skills, _ := r.Skills(ctx, userID)
	education, _ := r.Education(ctx, userID)
	experience, _ := r.Experiences(ctx, userID)
	links, _ := r.SocialLinks(ctx, userID)
	return map[string]any{
		"contact":     map[string]any{"first_name": profile.FirstName, "last_name": profile.LastName, "phone": profile.Phone, "location": profile.Location, "headline": profile.Headline},
		"target_role": profile.Title, "summary": profile.Bio, "skills": skills, "education": education, "experience": experience, "links": links,
		"projects": []any{}, "certifications": []any{}, "languages": []any{},
	}, nil
}

func (r *Repository) ResumeDocuments(ctx context.Context, userID uuid.UUID) ([]ResumeDocument, error) {
	rows, err := r.db.Query(ctx, resumeSelect()+` WHERE cp.user_id=$1 AND rd.deleted_at IS NULL ORDER BY rd.updated_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []ResumeDocument{}
	for rows.Next() {
		item, err := scanResume(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) ResumeDocument(ctx context.Context, userID, id uuid.UUID) (ResumeDocument, error) {
	item, err := scanResume(r.db.QueryRow(ctx, resumeSelect()+` WHERE cp.user_id=$1 AND rd.id=$2 AND rd.deleted_at IS NULL`, userID, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return item, auth.ErrNotFound
	}
	return item, err
}

func (r *Repository) CreateResumeDocument(ctx context.Context, userID uuid.UUID, req ResumeDocumentRequest) (ResumeDocument, error) {
	content, err := json.Marshal(req.Content)
	if err != nil {
		return ResumeDocument{}, err
	}
	order, err := json.Marshal(req.SectionOrder)
	if err != nil {
		return ResumeDocument{}, err
	}
	style, err := json.Marshal(req.Style)
	if err != nil {
		return ResumeDocument{}, err
	}
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return ResumeDocument{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var id uuid.UUID
	err = tx.QueryRow(ctx, `INSERT INTO resume_documents(candidate_profile_id,name,template_slug,content,section_order,style) SELECT id,$2,$3,$4,$5,$6 FROM candidate_profiles WHERE user_id=$1 AND deleted_at IS NULL RETURNING id`, userID, req.Name, req.TemplateSlug, content, order, style).Scan(&id)
	if err != nil {
		return ResumeDocument{}, err
	}
	_, err = tx.Exec(ctx, `INSERT INTO resume_document_versions(resume_document_id,version,name,template_slug,content,section_order,style) VALUES($1,1,$2,$3,$4,$5,$6)`, id, req.Name, req.TemplateSlug, content, order, style)
	if err != nil {
		return ResumeDocument{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return ResumeDocument{}, err
	}
	return r.ResumeDocument(ctx, userID, id)
}

func (r *Repository) UpdateResumeDocument(ctx context.Context, userID, id uuid.UUID, req ResumeDocumentRequest) (ResumeDocument, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return ResumeDocument{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	content, _ := json.Marshal(req.Content)
	order, _ := json.Marshal(req.SectionOrder)
	style, _ := json.Marshal(req.Style)
	var version int
	err = tx.QueryRow(ctx, `UPDATE resume_documents rd SET name=$3,template_slug=$4,content=$5,section_order=$6,style=$7,last_version=last_version+1,updated_at=NOW() FROM candidate_profiles cp WHERE rd.candidate_profile_id=cp.id AND cp.user_id=$1 AND rd.id=$2 AND rd.deleted_at IS NULL RETURNING rd.last_version`, userID, id, req.Name, req.TemplateSlug, content, order, style).Scan(&version)
	if errors.Is(err, pgx.ErrNoRows) {
		return ResumeDocument{}, auth.ErrNotFound
	}
	if err != nil {
		return ResumeDocument{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO resume_document_versions(resume_document_id,version,name,template_slug,content,section_order,style) VALUES($1,$2,$3,$4,$5,$6,$7)`, id, version, req.Name, req.TemplateSlug, content, order, style); err != nil {
		return ResumeDocument{}, err
	}
	if _, err = tx.Exec(ctx, `DELETE FROM resume_document_versions WHERE resume_document_id=$1 AND version NOT IN (SELECT version FROM resume_document_versions WHERE resume_document_id=$1 ORDER BY version DESC LIMIT 30)`, id); err != nil {
		return ResumeDocument{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return ResumeDocument{}, err
	}
	return r.ResumeDocument(ctx, userID, id)
}

func (r *Repository) DeleteResumeDocument(ctx context.Context, userID, id uuid.UUID) error {
	tag, err := r.db.Exec(ctx, `UPDATE resume_documents rd SET deleted_at=NOW() FROM candidate_profiles cp WHERE rd.candidate_profile_id=cp.id AND cp.user_id=$1 AND rd.id=$2 AND rd.deleted_at IS NULL`, userID, id)
	if err == nil && tag.RowsAffected() == 0 {
		return auth.ErrNotFound
	}
	return err
}

func (r *Repository) DuplicateResumeDocument(ctx context.Context, userID, id uuid.UUID) (ResumeDocument, error) {
	current, err := r.ResumeDocument(ctx, userID, id)
	if err != nil {
		return ResumeDocument{}, err
	}
	return r.CreateResumeDocument(ctx, userID, ResumeDocumentRequest{Name: current.Name + " Copy", TemplateSlug: current.TemplateSlug, Content: current.Content, SectionOrder: current.SectionOrder, Style: current.Style})
}

func (r *Repository) ResumeVersions(ctx context.Context, userID, id uuid.UUID) ([]ResumeDocumentVersion, error) {
	if _, err := r.ResumeDocument(ctx, userID, id); err != nil {
		return nil, err
	}
	rows, err := r.db.Query(ctx, `SELECT version,name,template_slug,content,section_order,style,created_at FROM resume_document_versions WHERE resume_document_id=$1 ORDER BY version DESC`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []ResumeDocumentVersion{}
	for rows.Next() {
		var item ResumeDocumentVersion
		var content, order, style []byte
		if err := rows.Scan(&item.Version, &item.Name, &item.TemplateSlug, &content, &order, &style, &item.CreatedAt); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(content, &item.Content)
		_ = json.Unmarshal(order, &item.SectionOrder)
		_ = json.Unmarshal(style, &item.Style)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) RestoreResumeVersion(ctx context.Context, userID, id uuid.UUID, version int) (ResumeDocument, error) {
	var req ResumeDocumentRequest
	var content, order, style []byte
	err := r.db.QueryRow(ctx, `SELECT v.name,v.template_slug,v.content,v.section_order,v.style FROM resume_document_versions v JOIN resume_documents rd ON rd.id=v.resume_document_id JOIN candidate_profiles cp ON cp.id=rd.candidate_profile_id WHERE cp.user_id=$1 AND rd.id=$2 AND v.version=$3 AND rd.deleted_at IS NULL`, userID, id, version).Scan(&req.Name, &req.TemplateSlug, &content, &order, &style)
	if errors.Is(err, pgx.ErrNoRows) {
		return ResumeDocument{}, auth.ErrNotFound
	}
	if err != nil {
		return ResumeDocument{}, err
	}
	_ = json.Unmarshal(content, &req.Content)
	_ = json.Unmarshal(order, &req.SectionOrder)
	_ = json.Unmarshal(style, &req.Style)
	return r.UpdateResumeDocument(ctx, userID, id, req)
}

func resumeSelect() string {
	return `SELECT rd.id,rd.name,rd.template_slug,rd.content,rd.section_order,rd.style,rd.is_primary,rd.last_version,rd.created_at,rd.updated_at FROM resume_documents rd JOIN candidate_profiles cp ON cp.id=rd.candidate_profile_id`
}

type resumeScanner interface{ Scan(...any) error }

func scanResume(row resumeScanner) (ResumeDocument, error) {
	var item ResumeDocument
	var content, order, style []byte
	err := row.Scan(&item.ID, &item.Name, &item.TemplateSlug, &content, &order, &style, &item.IsPrimary, &item.LastVersion, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		return item, err
	}
	_ = json.Unmarshal(content, &item.Content)
	_ = json.Unmarshal(order, &item.SectionOrder)
	_ = json.Unmarshal(style, &item.Style)
	return item, nil
}
