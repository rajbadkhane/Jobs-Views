package company

import (
	"mime/multipart"
	"net/textproto"
	"strings"
	"testing"
)

func TestSlugifyIncludesReadableNameAndSuffix(t *testing.T) {
	slug := slugify("Acme Software Pvt Ltd")
	if !strings.HasPrefix(slug, "acme-software-pvt-ltd-") {
		t.Fatalf("unexpected slug: %s", slug)
	}
}

func TestValidateMediaRejectsUnsupportedContentType(t *testing.T) {
	file := &multipart.FileHeader{
		Filename: "malware.exe",
		Size:     128,
		Header:   textproto.MIMEHeader{"Content-Type": []string{"application/x-msdownload"}},
	}
	if err := validateMedia("logo", file); err == nil {
		t.Fatal("expected validation error")
	}
}
