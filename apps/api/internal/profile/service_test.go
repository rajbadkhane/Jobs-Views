package profile

import "testing"

func TestCandidateCompletionCalculatesMissingFieldsAndStrength(t *testing.T) {
	completion := candidateCompletion(CandidateProfileRequest{
		FirstName: "Ada",
		LastName:  "Lovelace",
		Title:     "Engineer",
		Bio:       "Builds useful systems.",
	}, []Skill{{Name: "Go"}}, nil, nil, "")

	if completion.Score == 0 {
		t.Fatal("expected non-zero completion score")
	}
	if completion.Strength == "" {
		t.Fatal("expected profile strength")
	}
	if len(completion.MissingFields) == 0 {
		t.Fatal("expected missing fields")
	}
}
