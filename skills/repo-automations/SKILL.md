---
name: repo-automations
description: Create or change repository-owned scheduled, webhook, or agent-run automations. Use for their playbooks, runtime boundaries, and delivery failures.
---

# Repository automations

Find the existing playbook, code, workflow, and runtime before changing the
automation. Establish which system owns the trigger, deployed revision,
credentials, execution state, and delivery. Repository configuration alone
cannot establish what actually ran.

Keep deterministic transformation and transport in code or workflow
configuration. Use an agent playbook for work that needs investigation or
judgment. Keep scheduling and runtime grants with their owning host. Preserve
working conventions rather than introducing a new automation framework.

When the host can read the repository, its prompt should point to the playbook
available in that runtime's checkout. Avoid a second copy of the procedure.
Use ordinary Markdown for individual routines so each one does not become a
separate discoverable skill. [TEMPLATE.md](TEMPLATE.md) is a starting point for
new routines; omit fields that do not help.

For retries or external writes, define a stable deduplication key, the single
owner of each write, and the state to read before retrying. A partial operation
needs a recovery or compensation path. During migrations, prevent old and new
writers from overlapping unless duplicate execution is safe. A playbook does
not grant permission to send messages or make other external changes.

Check the real output and run record. For failures, isolate whether the trigger
fired, the correct revision ran, access was available, the procedure selected the
right data, and the destination accepted the result. Fix the owning layer; do
not add prose to compensate for a scheduler or access problem.
