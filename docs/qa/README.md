# Excelora QA evidence

Current handoff: 25 September 2026. See [implementation status](implementation-status.md), [validation](validation-results.md), [deployment](deployment-and-rollback.md), and [costs](cost-and-capacity.md).

The course now uses native-only lessons and continuous practice with the assessment question UI and calculator sidebar. PDFs are archived outside public delivery. The continuous-practice/activity migration is installed and authenticated live API workflows pass. This working tree has not been deployed to Vercel. See [launch setup](launch-setup.md) for remaining account settings.

Evidence includes native browser checks (`browser/native/results.json`), three-subject browser workflows (`browser/results.json`), mobile calculator/tutor checks (`browser/native-only/ui-results.json`), disposable database tests (`database-test-results.json`), authenticated checks (`live-course-tests.json`), current schema checks (`live-service-audit.json`) and dependency security (`dependency-audit.json`). Browser workflow APIs are mocked; they do not establish live deployment readiness.
