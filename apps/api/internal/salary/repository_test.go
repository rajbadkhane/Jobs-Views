package salary

import "testing"

func TestAnnualizeSalary(t *testing.T) {
	tests := []struct {
		name   string
		value  float64
		period string
		want   float64
		valid  bool
	}{
		{name: "hourly", value: 100, period: "hourly", want: 249600, valid: true},
		{name: "daily", value: 1000, period: "daily", want: 312000, valid: true},
		{name: "monthly", value: 25000, period: "monthly", want: 300000, valid: true},
		{name: "annual", value: 600000, period: "annual", want: 600000, valid: true},
		{name: "unsupported", value: 100, period: "weekly", want: 0, valid: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, valid := annualizeSalary(tt.value, tt.period)
			if valid != tt.valid || got != tt.want {
				t.Fatalf("annualizeSalary(%v, %q) = (%v, %v), want (%v, %v)", tt.value, tt.period, got, valid, tt.want, tt.valid)
			}
		})
	}
}

func TestConfidenceThresholds(t *testing.T) {
	tests := []struct {
		sample int
		want   string
	}{
		{sample: 3, want: "low"},
		{sample: 9, want: "low"},
		{sample: 10, want: "medium"},
		{sample: 29, want: "medium"},
		{sample: 30, want: "high"},
	}
	for _, tt := range tests {
		if got := confidence(tt.sample); got != tt.want {
			t.Fatalf("confidence(%d) = %q, want %q", tt.sample, got, tt.want)
		}
	}
}
