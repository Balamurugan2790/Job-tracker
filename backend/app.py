import os
import io
import PyPDF2
from docx import Document
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# Create Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///jobtracker.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    applications = db.relationship('Application', backref='user', lazy=True, cascade='all, delete-orphan')

class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(120), nullable=False)
    position = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    salary = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.String(500), nullable=False)
    
    applications = db.relationship('Application', backref='job', lazy=True, cascade='all, delete-orphan')

class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    status = db.Column(db.String(50), default='applied')
    date_applied = db.Column(db.DateTime, default=datetime.utcnow)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'User already exists'}), 400
    
    user = User(
        username=username,
        password_hash=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user = get_jwt_identity()
    return jsonify({'username': current_user}), 200

@app.route('/open_jobs', methods=['GET'])
@jwt_required()
def open_jobs():
    jobs = Job.query.all()
    jobs_list = [{
        'id': job.id,
        'company': job.company,
        'position': job.position,
        'location': job.location,
        'salary': job.salary,
        'description': job.description,
        'required_skills': job.required_skills
    } for job in jobs]
    return jsonify(jobs_list), 200

@app.route('/apply/<int:job_id>', methods=['POST'])
@jwt_required()
def apply_job(job_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Check if already applied
    existing_app = Application.query.filter_by(user_id=user.id, job_id=job_id).first()
    if existing_app:
        return jsonify({'message': 'Already applied'}), 400
    
    application = Application(user_id=user.id, job_id=job_id)
    db.session.add(application)
    db.session.commit()
    
    return jsonify({'message': 'Applied successfully', 'id': application.id}), 201

@app.route('/applications', methods=['GET'])
@jwt_required()
def get_applications():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify([]), 200
    
    applications = Application.query.filter_by(user_id=user.id).all()
    apps_list = []
    
    for app in applications:
        job = Job.query.get(app.job_id)
        apps_list.append({
            'id': app.id,
            'job_id': app.job_id,
            'status': app.status,
            'date_applied': app.date_applied.isoformat(),
            'listing': {
                'id': job.id,
                'company': job.company,
                'position': job.position,
                'location': job.location,
                'salary': job.salary,
                'description': job.description,
                'required_skills': job.required_skills
            } if job else None
        })
    
    return jsonify(apps_list), 200

@app.route('/applications/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_application(app_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    new_status = data.get('status')
    
    application = Application.query.get(app_id)
    
    if not application or application.user_id != user.id:
        return jsonify({'message': 'Application not found'}), 404
    
    application.status = new_status
    db.session.commit()
    
    return jsonify({'message': 'Status updated'}), 200

@app.route('/applications/<int:app_id>', methods=['DELETE'])
@jwt_required()
def delete_application(app_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    application = Application.query.get(app_id)
    
    if not application or application.user_id != user.id:
        return jsonify({'message': 'Application not found'}), 404
    
    db.session.delete(application)
    db.session.commit()
    
    return jsonify({'message': 'Application deleted'}), 200

@app.route('/insights', methods=['GET'])
@jwt_required()
def get_insights():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify({
            'total_applications': 0,
            'applied': 0,
            'interviews': 0,
            'rejected': 0,
            'success_rate': 0
        }), 200
    
    user_apps = Application.query.filter_by(user_id=user.id).all()
    
    total = len(user_apps)
    applied = sum(1 for a in user_apps if a.status == 'applied')
    interviews = sum(1 for a in user_apps if a.status == 'interview')
    hired = sum(1 for a in user_apps if a.status == 'hired')
    rejected = sum(1 for a in user_apps if a.status == 'rejected')
    success_rate = round((hired / total * 100), 1) if total > 0 else 0
    
    return jsonify({
        'total_applications': total,
        'applied': applied,
        'interviews': interviews,
        'rejected': rejected,
        'success_rate': success_rate
    }), 200

@app.route('/review_resume', methods=['POST'])
@jwt_required()
def review_resume():
    return jsonify({'feedback': 'Resume review feature coming soon'}), 200

@app.route('/parse-resume', methods=['POST'])
@jwt_required()
def parse_resume():
    if 'file' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400
    file = request.files['file']
    if not file.filename:
        return jsonify({'message': 'No file selected'}), 400
    filename = file.filename.lower()
    try:
        if filename.endswith('.txt'):
            text = file.read().decode('utf-8', errors='ignore')
        elif filename.endswith('.pdf'):
            reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
            text = '\n'.join(page.extract_text() or '' for page in reader.pages)
        elif filename.endswith('.docx'):
            doc = Document(io.BytesIO(file.read()))
            text = '\n'.join(para.text for para in doc.paragraphs)
        else:
            return jsonify({'message': 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.'}), 400
        if not text.strip():
            return jsonify({'message': 'Could not extract text from the file. It may be a scanned image-only PDF.'}), 422
        return jsonify({'text': text.strip()}), 200
    except Exception as e:
        return jsonify({'message': f'Error parsing file: {str(e)}'}), 500

def analyze_resume_against_job(resume_text, job):
    resume_lower = resume_text.lower()
    required_skills = [s.strip() for s in job.get('required_skills', '').split(',')]

    present_skills, missing_skills = [], []
    for skill in required_skills:
        (present_skills if skill.lower() in resume_lower else missing_skills).append(skill)

    cert_map = {
        'python': ['Python Institute PCEP/PCAP Certification', 'Google IT Automation with Python (Coursera)'],
        'java': ['Oracle Certified Professional: Java SE Developer', 'Spring Professional Certification'],
        'aws': ['AWS Certified Solutions Architect – Associate', 'AWS Certified Developer – Associate'],
        'azure': ['Microsoft Azure Fundamentals (AZ-900)', 'Microsoft Azure Administrator (AZ-104)'],
        'kubernetes': ['Certified Kubernetes Administrator (CKA)', 'Certified Kubernetes Application Developer (CKAD)'],
        'machine learning': ['DeepLearning.AI Machine Learning Specialization (Coursera)', 'Google Machine Learning Crash Course'],
        'pytorch': ['Deep Learning Specialization – DeepLearning.AI', 'Fast.ai Practical Deep Learning for Coders'],
        'spark': ['Databricks Apache Spark Developer Associate', 'Cloudera CCA Spark and Hadoop Developer'],
        'sql': ['Oracle Database SQL Certified Associate', 'Microsoft Certified: Azure Data Fundamentals'],
        'go': ['Go Programming – FreeCodeCamp / Pluralsight', 'Google Cloud Professional Developer'],
        'docker': ['Docker Certified Associate (DCA)'],
        'ci/cd': ['GitHub Actions Certification', 'Jenkins Engineer Certification'],
        'kafka': ['Confluent Certified Developer for Apache Kafka (CCDAK)'],
        'react': ['Meta Front-End Developer Professional Certificate (Coursera)', 'Zero to Mastery React Developer'],
        'swift': ['Apple Developer Academy', 'iOS & Swift – Complete iOS App Development Bootcamp'],
        'c#': ['Microsoft Certified: .NET Fundamentals', 'Microsoft Certified: Azure Developer Associate'],
        '.net': ['Microsoft Certified: .NET Fundamentals'],
        'distributed systems': ['AWS Certified Solutions Architect – Professional', 'Google Cloud Professional Cloud Architect'],
        'mlops': ['MLOps Specialization – DeepLearning.AI (Coursera)'],
        'scala': ['Functional Programming in Scala – Coursera (EPFL)'],
        'ruby': ['The Complete Ruby on Rails Developer Course – Udemy'],
        'graphql': ['Apollo GraphQL Developer Certification'],
        'microservices': ['Microservices with Node.js and React – Udemy (Grider)'],
    }

    project_map = {
        'python': 'Build a production-grade REST API with FastAPI, PostgreSQL, JWT auth, and Docker – include unit and integration tests.',
        'java': 'Develop a Spring Boot microservices application with inter-service REST/gRPC communication deployed on Docker Compose.',
        'aws': 'Deploy a 3-tier web app on AWS using EC2, RDS, S3, CloudFront, and Auto Scaling with Terraform Infrastructure as Code.',
        'azure': 'Build a serverless event-driven application using Azure Functions, Azure Service Bus, and Cosmos DB.',
        'kubernetes': 'Deploy a multi-container application on a local Kubernetes cluster using Helm charts, HPA, and an Ingress controller.',
        'machine learning': 'Build an end-to-end ML pipeline: data ingestion → preprocessing → training → evaluation → REST API serving.',
        'pytorch': 'Implement a custom neural network for image classification in PyTorch with a training loop, validation, and a web demo UI.',
        'spark': 'Build a batch data processing pipeline using PySpark to analyze a large public dataset (NYC taxi, airline delays, etc.).',
        'react': 'Build a full-stack app with React, REST backend, JWT auth, real-time WebSocket updates, and automated CI/CD to Vercel.',
        'sql': 'Design a normalized relational schema with complex JOINs, window functions, CTEs, and query-optimized indexes.',
        'go': 'Build a concurrent HTTP server in Go with middleware, connection pooling, and a Prometheus metrics endpoint.',
        'docker': 'Containerize a multi-service app with Docker Compose, health checks, volumes, and a GitHub Actions CI/CD pipeline.',
        'kafka': 'Build a real-time event streaming pipeline with Kafka producers, consumers, and exactly-once delivery semantics.',
        'ci/cd': 'Set up a full CI/CD pipeline with GitHub Actions: lint → test → build Docker image → push to registry → auto-deploy.',
        'graphql': 'Build a GraphQL API with subscriptions, mutations, and DataLoader to resolve N+1 query problems.',
        'mlops': 'Build an MLOps pipeline with MLflow experiment tracking, model registry, automated retraining, and Evidently monitoring.',
        'distributed systems': 'Implement a distributed key-value store with consistent hashing and replication to explore CAP theorem tradeoffs.',
        'microservices': 'Build a microservices system with service discovery, an API gateway, distributed tracing (Jaeger), and a circuit breaker.',
        'scala': 'Build a Spark Streaming application in Scala that consumes from Kafka and writes aggregated results to a database.',
    }

    certifications, projects, seen_certs, seen_projects = [], [], set(), set()
    for skill in missing_skills:
        skill_lower = skill.lower()
        for key, certs in cert_map.items():
            if key in skill_lower:
                for c in certs:
                    if c not in seen_certs:
                        certifications.append(c)
                        seen_certs.add(c)
        for key, proj in project_map.items():
            if key in skill_lower and key not in seen_projects:
                projects.append(f"{skill}: {proj}")
                seen_projects.add(key)

    improvements = []
    if len(resume_text.strip()) < 300:
        improvements.append("Resume is too brief — expand each experience with 3-5 bullets covering your specific contributions and measurable outcomes.")
    if not any(w in resume_lower for w in ['github.com', 'gitlab.com', 'portfolio']):
        improvements.append("Add a GitHub/GitLab profile link — hiring managers want to see your actual code and contributions.")
    if not any(w in resume_lower for w in ['%', 'increased', 'reduced', 'improved', 'delivered', 'achieved', 'saved', 'scaled', 'optimized', 'generated']):
        improvements.append("Quantify your impact: replace vague bullets with metrics like 'Reduced API latency by 35%' or 'Increased test coverage from 40% to 90%'.")
    if not any(w in resume_lower for w in ['summary', 'objective', 'profile', 'about']):
        improvements.append("Add a 3–4 sentence professional summary at the top, tailored to this specific role.")
    if 'linkedin' not in resume_lower:
        improvements.append("Include your LinkedIn profile URL so recruiters can quickly view your full history.")
    job_desc_lower = job.get('description', '').lower()
    if 'on-call' in job_desc_lower and 'on-call' not in resume_lower:
        improvements.append("This role mentions on-call duties — highlight any production ownership and incident response experience you have.")
    if 'mentor' in job_desc_lower and 'mentor' not in resume_lower:
        improvements.append("This role involves mentoring — add examples where you guided junior engineers or led code reviews.")
    if not improvements:
        improvements.append("Overall structure looks solid. Fine-tune your bullet points to mirror the exact language in this job description.")

    important_kws = ['scalable', 'high availability', 'distributed', 'microservices', 'production', 'ci/cd',
                     'agile', 'scrum', 'cross-functional', 'test-driven', 'fault-tolerant', 'observability',
                     'on-call', 'ownership', 'technical leadership', 'architecture', 'reliability', 'cloud-native']
    recommended_keywords = list(missing_skills)
    for kw in important_kws:
        if kw in job_desc_lower and kw not in resume_lower and kw not in recommended_keywords:
            recommended_keywords.append(kw)

    match_score = round(len(present_skills) / len(required_skills) * 100) if required_skills else 0

    return {
        'job_title': job['position'],
        'company': job['company'],
        'missing_skills': missing_skills,
        'present_skills': present_skills,
        'recommended_keywords': recommended_keywords[:8],
        'suggested_projects': projects[:4] if projects else [
            f"Build a portfolio project demonstrating hands-on expertise in {', '.join(required_skills[:3])}.",
            "Contribute to an open-source project using the core technologies listed in this job's requirements.",
        ],
        'certifications': certifications[:5] if certifications else [
            "Research vendor-specific certifications aligned with this company's primary tech stack.",
            "Consider a cloud certification: AWS Solutions Architect, GCP Associate Cloud Engineer, or AZ-104.",
        ],
        'improvements': improvements,
        'match_score': match_score,
    }

@app.route('/ai-chat', methods=['POST'])
@jwt_required()
def ai_chat():
    data = request.get_json()
    resume_text = (data.get('resume_text') or '').strip()
    job_id = data.get('job_id')
    if not resume_text:
        return jsonify({'message': 'Resume text is required'}), 400
    if not job_id:
        return jsonify({'message': 'Job ID is required'}), 400
    
    job = Job.query.get(int(job_id))
    if not job:
        return jsonify({'message': 'Job not found'}), 404
    
    job_dict = {
        'position': job.position,
        'company': job.company,
        'description': job.description,
        'required_skills': job.required_skills
    }
    
    return jsonify(analyze_resume_against_job(resume_text, job_dict)), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'message': 'Server error'}), 500

# Initialize database on app startup (works with both local and gunicorn)
with app.app_context():
    db.create_all()
    if Job.query.count() == 0:
        default_jobs = [
            {
                'company': 'Google',
                'position': 'Senior Software Engineer',
                'location': 'Mountain View, CA',
                'salary': '$160,000 - $200,000',
                'description': 'Join Google\'s core infrastructure team to design and build highly scalable distributed systems that power billions of users worldwide.\n\nYou will work on challenging problems in areas such as storage, networking, and compute infrastructure. You\'ll collaborate with world-class engineers to architect solutions that need to handle massive scale reliably.\n\nResponsibilities include designing system components, writing high-quality code, conducting code reviews, and mentoring junior engineers. You\'ll participate in on-call rotations and drive reliability improvements across critical services.\n\nWe value engineers who think deeply about problems, communicate clearly, and take ownership of their work from design through deployment and monitoring.',
                'required_skills': 'Python, Java, C++, Distributed Systems, Kubernetes'
            },
            {
                'company': 'Microsoft',
                'position': 'Principal Cloud Architect',
                'location': 'Seattle, WA',
                'salary': '$180,000 - $220,000',
                'description': 'Microsoft Azure is looking for a Principal Cloud Architect to lead the design of next-generation cloud services used by enterprise customers globally.\n\nIn this role, you will define the architectural vision for Azure services, working closely with product managers and engineering leads to translate customer needs into scalable technical solutions. You will conduct architecture reviews, establish best practices, and ensure consistency across service boundaries.\n\nYou will represent your team in cross-org technical discussions and contribute to long-term platform strategy. Strong written and verbal communication skills are essential as you will regularly present to senior leadership.\n\nIdeal candidates have deep expertise in cloud-native design patterns, microservices, and enterprise integration scenarios.',
                'required_skills': 'Azure, C#, .NET, Microservices, System Design'
            },
            {
                'company': 'Meta',
                'position': 'Full Stack Engineer',
                'location': 'Menlo Park, CA',
                'salary': '$155,000 - $195,000',
                'description': 'Meta\'s Growth team is seeking a Full Stack Engineer to build high-impact features that improve how people connect and share on Facebook and Instagram.\n\nYou will own features end-to-end, from backend API design to polished user interfaces. Working in a fast-paced environment, you\'ll run experiments, analyze results, and iterate quickly based on data. Our team ships to billions of users, so performance and reliability are top priorities.\n\nYou\'ll work closely with product designers and data scientists to craft experiences that delight users. We use React on the frontend and a mix of Python and Hack on the backend, with GraphQL connecting the two.\n\nWe value engineers who are product-minded, move quickly, and are comfortable with ambiguity.',
                'required_skills': 'React, Python, GraphQL, SQL, A/B Testing'
            },
            {
                'company': 'Amazon',
                'position': 'Software Development Engineer II',
                'location': 'Seattle, WA (Hybrid)',
                'salary': '$145,000 - $185,000',
                'description': 'Amazon\'s Payments team is hiring a Software Development Engineer to help build the payment processing infrastructure that powers Amazon\'s global marketplace.\n\nYou will design and implement services that handle millions of transactions per day with extremely high availability and fault-tolerance requirements. You\'ll own your services through the full SDLC — writing design documents, coding, testing, deploying, and monitoring in production.\n\nOur team operates with a high degree of autonomy and follows a two-pizza team model. You\'ll be expected to lead technical discussions, make architectural decisions, and deliver complex projects on time.\n\nStrong candidates will have experience with high-throughput distributed systems, operational excellence, and a track record of building robust production services.',
                'required_skills': 'Java, AWS, DynamoDB, SQS, Distributed Systems'
            },
            {
                'company': 'Apple',
                'position': 'iOS Software Engineer',
                'location': 'Cupertino, CA',
                'salary': '$150,000 - $190,000',
                'description': 'Apple\'s Health team is looking for a talented iOS Software Engineer to help build health and wellness features used by millions of Apple Watch and iPhone users.\n\nYou will work on the HealthKit framework and Health app, building features that help users understand and improve their health. Your work will have a direct impact on people\'s lives, from fitness tracking to clinical health records integration.\n\nYou\'ll collaborate with hardware teams, machine learning engineers, and UX designers to deliver seamless and beautiful experiences. We have very high standards for performance, privacy, and reliability — every detail matters at Apple.\n\nIdeal candidates have deep knowledge of Swift and UIKit, a passion for great user experiences, and a strong understanding of privacy-preserving software design.',
                'required_skills': 'Swift, Objective-C, UIKit, CoreData, HealthKit'
            },
            {
                'company': 'Netflix',
                'position': 'Senior Data Engineer',
                'location': 'Los Gatos, CA (Remote)',
                'salary': '$165,000 - $210,000',
                'description': 'Netflix\'s Data Platform team is seeking a Senior Data Engineer to help build and scale the infrastructure that powers content and member analytics across one of the world\'s largest streaming services.\n\nYou will design and maintain data pipelines, data warehouses, and real-time streaming systems that process petabytes of data daily. Your work will directly enable data-driven decision-making across engineering, content, marketing, and product teams.\n\nThe ideal candidate is comfortable working across the full data stack — from ingestion and storage to transformation and serving. We use Apache Spark, Kafka, Flink, and a custom internal platform called Metacat for data discovery and governance.\n\nWe look for engineers who are strong communicators, can influence data infrastructure decisions at scale, and care deeply about data quality and reliability.',
                'required_skills': 'Apache Spark, Kafka, Python, SQL, Scala, Data Modeling'
            },
            {
                'company': 'Stripe',
                'position': 'Backend Engineer – Payments',
                'location': 'San Francisco, CA (Remote)',
                'salary': '$155,000 - $200,000',
                'description': 'Stripe is looking for a Backend Engineer to join the Payments team, where you\'ll help build the financial infrastructure that millions of businesses rely on to accept payments globally.\n\nYou will work on the critical path of payment processing, building reliable, low-latency APIs and internal services. Our systems need to handle complex financial logic, fraud prevention, and reconciliation across hundreds of payment methods and currencies.\n\nYou\'ll participate in technical design discussions, write clean and maintainable Ruby or Go code, and take pride in operational excellence. Stripe engineers own their code in production, participating in on-call rotations and driving down error rates.\n\nWe care deeply about correctness and reliability — errors in payments have real financial consequences for our users.',
                'required_skills': 'Ruby, Go, PostgreSQL, Redis, REST APIs, Payments Domain'
            },
            {
                'company': 'Airbnb',
                'position': 'Machine Learning Engineer',
                'location': 'San Francisco, CA (Hybrid)',
                'salary': '$160,000 - $205,000',
                'description': 'Airbnb\'s AI & ML team is hiring a Machine Learning Engineer to build and deploy models that improve guest and host experiences across our marketplace.\n\nYou\'ll work on search ranking, pricing optimization, fraud detection, and personalization systems that directly impact revenue and trust on the platform. You\'ll collaborate with data scientists to take models from experimentation to production, building the infrastructure needed to train, evaluate, deploy, and monitor ML systems at scale.\n\nOur ML platform is built on Python, PyTorch, and Airflow for orchestration, with real-time serving via our internal feature store. You\'ll own the reliability and performance of models in production and continuously improve them.\n\nStrong candidates will have experience bridging research and engineering, with a track record of shipping impactful ML features.',
                'required_skills': 'Python, PyTorch, Spark, Airflow, Feature Engineering, MLOps'
            },
            {
                'company': 'Salesforce',
                'position': 'Senior Frontend Engineer',
                'location': 'San Francisco, CA (Hybrid)',
                'salary': '$140,000 - $175,000',
                'description': 'Salesforce\'s Lightning Platform team is seeking a Senior Frontend Engineer to help build the next generation of our enterprise CRM user interface used by over 150,000 companies worldwide.\n\nYou will architect and implement complex UI components, improve performance, and ensure accessibility across the Lightning Design System. Working at enterprise scale means solving unique challenges around component reuse, theming, and backwards compatibility.\n\nYou will mentor junior engineers, lead frontend architecture discussions, and establish coding standards. You\'ll partner closely with UX designers to translate designs into pixel-perfect, performant implementations.\n\nWe are looking for engineers with a deep knowledge of modern JavaScript, component architecture patterns, and a strong commitment to web standards and accessibility.',
                'required_skills': 'JavaScript, React, LWC, Web Components, CSS, Accessibility'
            },
            {
                'company': 'Spotify',
                'position': 'Backend Engineer – Music Discovery',
                'location': 'New York, NY (Hybrid)',
                'salary': '$135,000 - $170,000',
                'description': 'Spotify\'s Music Discovery squad is looking for a Backend Engineer to help power the recommendation and discovery features that connect 600 million users with music they love.\n\nYou\'ll build APIs and backend services that feed our recommendation engine, playlist generators, and editorial tools. Working on a cross-functional squad with data scientists, ML engineers, and designers, you\'ll have end-to-end ownership of discovery features.\n\nOur backend stack uses Java and Python microservices deployed on GCP with a heavy emphasis on event-driven architecture via Kafka. You\'ll engage in technical planning, lead the design of new services, and contribute to our open source ecosystem.\n\nWe value autonomy, creativity, and the belief that technology can make the world a better place through music.',
                'required_skills': 'Java, Python, Kafka, GCP, Microservices, SQL'
            },
            {
                'company': 'LinkedIn',
                'position': 'Staff Engineer – Feed Infrastructure',
                'location': 'Sunnyvale, CA',
                'salary': '$200,000 - $250,000',
                'description': 'LinkedIn is seeking a Staff Engineer to lead technical strategy for Feed Infrastructure, the backbone powering the LinkedIn feed for over 1 billion members.\n\nAs a Staff Engineer, you will drive large-scale technical initiatives, define the multi-year roadmap for feed architecture, and mentor senior engineers across two or more teams. You\'ll represent engineering in product strategy discussions and make critical decisions on latency, reliability, and scalability.\n\nYou will lead the development of stream processing pipelines, caching strategies, and real-time ranking systems that handle millions of feed refreshes per minute. This is a high-impact, high-visibility role at the intersection of infrastructure and product.\n\nSuccessful candidates will have a proven track record of leading large cross-functional engineering projects, strong communication skills, and technical depth across distributed systems.',
                'required_skills': 'Java, Kafka, Espresso, REST, Distributed Systems, Technical Leadership'
            },
            {
                'company': 'Uber',
                'position': 'Platform Engineer – Developer Experience',
                'location': 'San Francisco, CA',
                'salary': '$145,000 - $185,000',
                'description': 'Uber\'s Developer Experience team is hiring a Platform Engineer to improve the tools and workflows used by thousands of engineers building Uber\'s global platform.\n\nYou\'ll work on internal developer platforms, CI/CD pipelines, build systems, and developer tooling that directly improve engineering productivity. Your goal is to make every Uber engineer\'s day better — faster build times, better testing frameworks, smoother deployments.\n\nYou\'ll own critical internal infrastructure and be the technical lead on projects to reduce toil and increase developer velocity. Strong knowledge of containerization, build orchestration, and observability is essential.\n\nWe\'re looking for people who are passionate about developer experience, empathetic to fellow engineers\' pain points, and skilled at building internal platforms that scale.',
                'required_skills': 'Go, Kubernetes, Bazel, CI/CD, Docker, Observability'
            },
            {
                'company': 'Twilio',
                'position': 'Software Engineer – Communications APIs',
                'location': 'Remote (US)',
                'salary': '$130,000 - $165,000',
                'description': 'Twilio is hiring a Software Engineer to join the Core Communications team, building the SMS, Voice, and WhatsApp APIs used by over 300,000 businesses to communicate with their customers.\n\nYou will design and implement features for our communications platform, ensuring ultra-high availability and global reach. You\'ll work across the stack — from low-level telecom integrations to high-level API design — and contribute to the reliability of services that millions of end users depend on every day.\n\nCode quality and testing are a major focus for our team. You\'ll write comprehensive unit and integration tests, participate in thorough code reviews, and cultivate a culture of engineering excellence.\n\nWe believe in empowering every developer to build better communications. If you\'re excited about APIs, distributed systems, and real-world impact, we\'d love to hear from you.',
                'required_skills': 'Python, Node.js, REST APIs, PostgreSQL, Kafka, AWS'
            }
        ]
        
        for job_data in default_jobs:
            job = Job(**job_data)
            db.session.add(job)
        
        db.session.commit()
        print("Database initialized with default jobs")

if __name__ == '__main__':
    print("Starting Flask server with SQLite database...")
    app.run(debug=True, port=5000)
