package salary

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/redis/go-redis/v9"
)

type Service struct {
	repo  *Repository
	cache *redis.Client
}

func NewService(repo *Repository, cache *redis.Client) *Service {
	return &Service{repo: repo, cache: cache}
}

func (s *Service) Options(ctx context.Context) (Options, error) { return s.repo.Options(ctx) }

func (s *Service) Estimate(ctx context.Context, req EstimateRequest) (Estimate, error) {
	if req.Display == "" {
		req.Display = "annual"
	}
	key := fmt.Sprintf("salary:estimate:%s:%s:%.1f:%s:%s:%s", strings.ToLower(req.Role), strings.ToLower(req.City), req.Experience, req.WorkMode, strings.ToLower(req.Education), strings.ToLower(req.Shift))
	if s.cache != nil {
		if raw, err := s.cache.Get(ctx, key).Bytes(); err == nil {
			var cached Estimate
			if json.Unmarshal(raw, &cached) == nil {
				cached.Display = req.Display
				return cached, nil
			}
		}
	}
	benchmark, err := s.repo.Resolve(ctx, req.Role, req.City, req.Experience, req.WorkMode, req.Education, req.Shift)
	if errors.Is(err, pgx.ErrNoRows) {
		return Estimate{Available: false, Message: "There is not enough reviewed market evidence for this role and location yet. Try India or another listed city.", RequestedRole: req.Role, RequestedCity: req.City, Display: req.Display, MethodologyURL: "/salary/methodology"}, nil
	}
	if err != nil {
		return Estimate{}, err
	}
	result := Estimate{Available: true, Message: "Estimate based on the most specific reviewed evidence available.", RequestedRole: req.Role, RequestedCity: req.City, Display: req.Display, Benchmark: &benchmark, Stale: time.Since(benchmark.EffectiveDate) > 400*24*time.Hour, MethodologyURL: "/salary/methodology"}
	if s.cache != nil {
		if raw, err := json.Marshal(result); err == nil {
			_ = s.cache.Set(ctx, key, raw, 6*time.Hour).Err()
		}
	}
	return result, nil
}

func (s *Service) Benchmark(ctx context.Context, role, city string) (Estimate, error) {
	return s.Estimate(ctx, EstimateRequest{Role: role, City: city, Display: "annual"})
}
