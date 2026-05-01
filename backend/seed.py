"""
Seed script — runs automatically on first startup, or manually:
  python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, timedelta
from app.db.database import SessionLocal
from app.models.user import User, UserRole
from app.models.project import Project
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.activity_log import ActivityLog
from app.core.security import get_password_hash


def seed():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        # ── Users ──────────────────────────────────────────────────────────────
        users_data = [
            ("admin",    "admin@email.com",    "123456", UserRole.admin),
            ("member1",  "member1@email.com",  "123456", UserRole.member),
            ("member2",  "member2@email.com",  "123456", UserRole.member),
            ("member3",  "member3@email.com",  "123456", UserRole.member),
            ("member4",  "member4@email.com",  "123456", UserRole.member),
            ("member5",  "member5@email.com",  "123456", UserRole.member),
            ("member6",  "member6@email.com",  "123456", UserRole.member),
            ("member7",  "member7@email.com",  "123456", UserRole.member),
            ("member8",  "member8@email.com",  "123456", UserRole.member),
            ("member9",  "member9@email.com",  "123456", UserRole.member),
            ("member10", "member10@email.com", "123456", UserRole.member),
            ("member11", "member11@email.com", "123456", UserRole.member),
            ("member12", "member12@email.com", "123456", UserRole.member),
            ("member13", "member13@email.com", "123456", UserRole.member),
        ]

        users = []
        for name, email, password, role in users_data:
            u = User(name=name, email=email, password=get_password_hash(password), role=role, is_active=True)
            db.add(u)
            users.append(u)
        db.flush()

        admin   = users[0]
        members = users[1:]   # member1 … member13

        # ── Projects ───────────────────────────────────────────────────────────
        projects_data = [
            ("Website Redesign",          "Redesign the company website with modern UI/UX"),
            ("Mobile App v2",             "Build the next version of the mobile application"),
            ("API Integration",           "Integrate third-party APIs into the platform"),
            ("Data Analytics Dashboard",  "Build analytics and reporting dashboard"),
            ("DevOps Pipeline",           "Set up CI/CD and infrastructure automation"),
            ("Customer Portal",           "Self-service portal for enterprise customers"),
            ("Security Audit",            "Full security review and penetration testing"),
        ]

        projects = []
        for name, desc in projects_data:
            p = Project(name=name, description=desc, created_by=admin.id)
            db.add(p)
            projects.append(p)
        db.flush()

        today = date.today()

        # ── Tasks ──────────────────────────────────────────────────────────────
        # (title, description, status, priority, due_offset_days, project_idx, assignee_member_idx)
        # Negative due_offset = overdue (past due date)
        tasks_data = [
            # ── Website Redesign ──────────────────────────────────────────────
            ("Design homepage mockup",      "Create Figma mockups for homepage",              TaskStatus.done,        TaskPriority.high,    -30, 0,  0),
            ("Implement navbar",            "Build responsive navigation component",           TaskStatus.done,        TaskPriority.medium,  -20, 0,  1),
            ("Hero section animation",      "Add scroll animations to hero section",           TaskStatus.in_progress, TaskPriority.medium,    5, 0,  2),
            ("SEO optimization",            "Add meta tags and structured data",               TaskStatus.todo,        TaskPriority.low,      12, 0,  3),
            ("Cross-browser testing",       "Test on Chrome, Firefox, Safari, Edge",           TaskStatus.todo,        TaskPriority.high,     18, 0,  4),
            ("Performance audit",           "Run Lighthouse and fix issues",                   TaskStatus.todo,        TaskPriority.medium,   -5, 0,  5),  # overdue
            ("Accessibility review",        "WCAG 2.1 compliance check",                       TaskStatus.todo,        TaskPriority.high,     -8, 0,  6),  # overdue
            ("Content migration",           "Migrate blog posts to new CMS",                   TaskStatus.in_progress, TaskPriority.low,      -3, 0,  7),  # overdue

            # ── Mobile App v2 ─────────────────────────────────────────────────
            ("Auth flow redesign",          "Redesign login and signup screens",               TaskStatus.done,        TaskPriority.high,    -25, 1,  1),
            ("Push notifications",          "Implement FCM push notifications",                TaskStatus.in_progress, TaskPriority.high,      7, 1,  2),
            ("Offline mode",                "Add offline caching with SQLite",                 TaskStatus.todo,        TaskPriority.medium,   20, 1,  3),
            ("App store submission",        "Prepare assets and submit to stores",             TaskStatus.todo,        TaskPriority.high,     -6, 1,  4),  # overdue
            ("Beta testing",                "Coordinate beta testing with 50 users",           TaskStatus.in_progress, TaskPriority.medium,    3, 1,  5),
            ("Crash analytics setup",       "Integrate Firebase Crashlytics",                  TaskStatus.done,        TaskPriority.low,     -10, 1,  6),
            ("Dark mode support",           "Implement system-level dark mode toggle",         TaskStatus.todo,        TaskPriority.medium,   -2, 1,  7),  # overdue
            ("Biometric login",             "Add Face ID / fingerprint authentication",        TaskStatus.todo,        TaskPriority.high,     15, 1,  8),

            # ── API Integration ───────────────────────────────────────────────
            ("Stripe payment integration",  "Integrate Stripe for subscription billing",       TaskStatus.done,        TaskPriority.high,    -30, 2,  2),
            ("Twilio SMS setup",            "Add SMS notifications via Twilio",                TaskStatus.in_progress, TaskPriority.medium,    8, 2,  3),
            ("OAuth2 providers",            "Add Google and GitHub OAuth login",               TaskStatus.todo,        TaskPriority.high,     12, 2,  4),
            ("Webhook handler",             "Build webhook endpoint for events",               TaskStatus.todo,        TaskPriority.medium,   -4, 2,  5),  # overdue
            ("Rate limiting",               "Add API rate limiting middleware",                 TaskStatus.done,        TaskPriority.low,     -18, 2,  6),
            ("API documentation",           "Write OpenAPI docs for all endpoints",            TaskStatus.in_progress, TaskPriority.low,       6, 2,  7),
            ("GraphQL layer",               "Add GraphQL endpoint alongside REST",             TaskStatus.todo,        TaskPriority.medium,   25, 2,  8),
            ("API versioning",              "Implement /v1 and /v2 routing strategy",          TaskStatus.todo,        TaskPriority.low,      -9, 2,  9),  # overdue

            # ── Data Analytics Dashboard ──────────────────────────────────────
            ("Data pipeline setup",         "Build ETL pipeline for raw data",                 TaskStatus.done,        TaskPriority.high,    -22, 3,  3),
            ("Chart components",            "Build reusable Recharts components",              TaskStatus.done,        TaskPriority.medium,  -12, 3,  4),
            ("Export to CSV/PDF",           "Add export functionality to reports",             TaskStatus.in_progress, TaskPriority.medium,    9, 3,  5),
            ("Real-time updates",           "Add WebSocket for live dashboard updates",        TaskStatus.todo,        TaskPriority.high,     18, 3,  6),
            ("User permissions for reports","Role-based access to report sections",            TaskStatus.todo,        TaskPriority.medium,   -7, 3,  7),  # overdue
            ("Dashboard onboarding tour",   "Add interactive onboarding for new users",        TaskStatus.todo,        TaskPriority.low,      25, 3,  8),
            ("Scheduled email reports",     "Send weekly digest emails to managers",           TaskStatus.todo,        TaskPriority.medium,   -1, 3,  9),  # overdue
            ("Anomaly detection alerts",    "Flag unusual metric spikes automatically",        TaskStatus.in_progress, TaskPriority.high,     14, 3, 10),

            # ── DevOps Pipeline ───────────────────────────────────────────────
            ("Docker setup",                "Containerize all services with Docker",           TaskStatus.done,        TaskPriority.high,    -35, 4,  4),
            ("GitHub Actions CI",           "Set up CI pipeline with automated tests",         TaskStatus.done,        TaskPriority.high,    -28, 4,  5),
            ("Kubernetes deployment",       "Deploy to K8s cluster on AWS EKS",               TaskStatus.in_progress, TaskPriority.high,     14, 4,  6),
            ("Monitoring with Grafana",     "Set up Prometheus and Grafana dashboards",        TaskStatus.todo,        TaskPriority.medium,   22, 4,  7),
            ("Auto-scaling policy",         "Configure HPA for backend services",              TaskStatus.todo,        TaskPriority.medium,   -6, 4,  8),  # overdue
            ("Secrets management",          "Migrate secrets to AWS Secrets Manager",          TaskStatus.todo,        TaskPriority.high,     30, 4,  9),
            ("Log aggregation",             "Centralise logs with ELK stack",                  TaskStatus.todo,        TaskPriority.medium,  -11, 4, 10),  # overdue
            ("Disaster recovery plan",      "Document and test DR runbook",                    TaskStatus.todo,        TaskPriority.high,     -3, 4, 11),  # overdue

            # ── Customer Portal ───────────────────────────────────────────────
            ("Portal wireframes",           "Design wireframes for customer self-service",     TaskStatus.done,        TaskPriority.high,    -15, 5,  0),
            ("SSO integration",             "Connect portal to company SSO provider",          TaskStatus.in_progress, TaskPriority.high,      5, 5,  1),
            ("Ticket submission form",      "Build support ticket creation flow",              TaskStatus.todo,        TaskPriority.medium,   10, 5,  2),
            ("Invoice download",            "Allow customers to download past invoices",       TaskStatus.todo,        TaskPriority.low,      -4, 5,  3),  # overdue
            ("Usage analytics page",        "Show customers their own usage metrics",          TaskStatus.todo,        TaskPriority.medium,   20, 5,  4),
            ("Email notification prefs",    "Let customers manage notification settings",      TaskStatus.in_progress, TaskPriority.low,      -2, 5,  5),  # overdue
            ("Multi-language support",      "Add i18n for EN, ES, FR, DE",                    TaskStatus.todo,        TaskPriority.medium,   35, 5,  6),
            ("Accessibility audit portal",  "WCAG audit for customer portal pages",            TaskStatus.todo,        TaskPriority.high,     -9, 5,  7),  # overdue

            # ── Security Audit ────────────────────────────────────────────────
            ("Dependency vulnerability scan","Run Snyk / OWASP on all repos",                 TaskStatus.done,        TaskPriority.high,    -20, 6,  8),
            ("Penetration testing",         "Hire external pen-test firm",                     TaskStatus.in_progress, TaskPriority.high,      3, 6,  9),
            ("MFA enforcement",             "Enforce MFA for all admin accounts",              TaskStatus.done,        TaskPriority.high,    -14, 6, 10),
            ("GDPR data mapping",           "Document all PII data flows",                     TaskStatus.todo,        TaskPriority.high,     -5, 6, 11),  # overdue
            ("Security training",           "Mandatory phishing awareness training",           TaskStatus.todo,        TaskPriority.medium,    7, 6, 12),
            ("Incident response playbook",  "Write and review IR playbook",                    TaskStatus.todo,        TaskPriority.high,     -8, 6,  0),  # overdue
            ("SSL certificate renewal",     "Renew wildcard SSL cert before expiry",           TaskStatus.todo,        TaskPriority.high,     -1, 6,  1),  # overdue
            ("API key rotation",            "Rotate all third-party API keys",                 TaskStatus.in_progress, TaskPriority.medium,    4, 6,  2),
        ]

        tasks = []
        for title, desc, status, priority, due_offset, proj_idx, member_idx in tasks_data:
            t = Task(
                title=title,
                description=desc,
                status=status,
                priority=priority,
                due_date=today + timedelta(days=due_offset),
                project_id=projects[proj_idx].id,
                assigned_to=members[member_idx % len(members)].id,
                created_by=admin.id,
            )
            db.add(t)
            tasks.append(t)
        db.flush()

        # ── Activity Logs ──────────────────────────────────────────────────────
        for p in projects:
            db.add(ActivityLog(
                action="project_created",
                details=f"Project '{p.name}' created",
                user_id=admin.id,
                project_id=p.id,
            ))

        for t in tasks:
            db.add(ActivityLog(
                action="task_created",
                details=f"Task '{t.title}' created and assigned",
                user_id=admin.id,
                task_id=t.id,
                project_id=t.project_id,
            ))
            if t.status == TaskStatus.done:
                db.add(ActivityLog(
                    action="task_completed",
                    details=f"Task '{t.title}' marked as done",
                    user_id=t.assigned_to,
                    task_id=t.id,
                    project_id=t.project_id,
                ))
            elif t.status == TaskStatus.in_progress:
                db.add(ActivityLog(
                    action="task_started",
                    details=f"Task '{t.title}' moved to in progress",
                    user_id=t.assigned_to,
                    task_id=t.id,
                    project_id=t.project_id,
                ))
            # Log overdue tasks
            if t.due_date and t.due_date < today and t.status != TaskStatus.done:
                db.add(ActivityLog(
                    action="task_overdue",
                    details=f"Task '{t.title}' is overdue since {t.due_date}",
                    user_id=admin.id,
                    task_id=t.id,
                    project_id=t.project_id,
                ))

        db.commit()

        total_overdue = sum(
            1 for t in tasks
            if t.due_date and t.due_date < today and t.status != TaskStatus.done
        )
        print(f"✅ Seeded: {len(users)} users, {len(projects)} projects, "
              f"{len(tasks)} tasks ({total_overdue} overdue)")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    from app.db.database import create_tables
    create_tables()
    seed()
