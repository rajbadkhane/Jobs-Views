# Joining Workflow

## Purpose

The joining workflow starts when an offer is accepted and ends when the candidate is marked joined or closed.

## Default Steps

1. Offer Accepted
2. Documents Submitted
3. Verification
4. Joining Date
5. Joined
6. Probation Placeholder
7. Completed

## Data Model

`joining_workflows` stores the current step, full checklist, joining date, status, and metadata against the application.

## Automation

Recommended automation:

- Create joining document task after offer acceptance
- Notify candidate about pending documents
- Notify recruiter about verification delay
- Remind candidate before joining date
- Move application to joined after joining confirmation

