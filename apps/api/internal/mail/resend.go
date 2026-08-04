package mail

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"careeros/api/internal/config"
)

type Sender interface {
	Send(ctx context.Context, to, subject, html string) error
}

type SenderFunc func(ctx context.Context, to, subject, html string) error

func (f SenderFunc) Send(ctx context.Context, to, subject, html string) error {
	return f(ctx, to, subject, html)
}

func NewSender(cfg config.MailConfig, log *slog.Logger) Sender {
	if cfg.Provider == "resend" && cfg.APIKey != "" {
		return &ResendSender{from: cfg.From, apiKey: cfg.APIKey, client: &http.Client{Timeout: 10 * time.Second}}
	}
	return SenderFunc(func(_ context.Context, to, subject, html string) error {
		log.Info("mail queued", "provider", cfg.Provider, "to", to, "subject", subject, "html", html)
		return nil
	})
}

type ResendSender struct {
	from   string
	apiKey string
	client *http.Client
}

func (s *ResendSender) Send(ctx context.Context, to, subject, html string) error {
	body, err := json.Marshal(map[string]any{
		"from":    s.from,
		"to":      []string{to},
		"subject": subject,
		"html":    html,
	})
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := s.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("resend email failed with status %d", resp.StatusCode)
	}
	return nil
}
