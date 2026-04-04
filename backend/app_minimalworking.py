import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# Create Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
jwt = JWTManager(app)

# In-memory storage
users = {}
jobs = [
    {
        'id': 1,
        'company': 'Google',
        'position': 'Senior Software Engineer',
        'location': 'Mountain View, CA',
        'salary': '$160,000 - $200,000',
        'description': 'Join Google\'s core infrastructure team to design and build highly scalable distributed systems that power billions of users worldwide.\n\nYou will work on challenging problems in areas such as storage, networking, and compute infrastructure. You\'ll collaborate with world-class engineers to architect solutions that need to handle massive scale reliably.\n\nResponsibilities include designing system components, writing high-quality code, conducting code reviews, and mentoring junior engineers. You\'ll participate in on-call rotations and drive reliability improvements across critical services.\n\nWe value engineers who think deeply about problems, communicate clearly, and take ownership of their work from design through deployment and monitoring.',
        'required_skills': 'Python, Java, C++, Distributed Systems, Kubernetes'
    },
    {
        'id': 2,
        'company': 'Microsoft',
        'position': 'Principal Cloud Architect',
        'location': 'Seattle, WA',
        'salary': '$180,000 - $220,000',
        'description': 'Microsoft Azure is looking for a Principal Cloud Architect to lead the design of next-generation cloud services used by enterprise customers globally.\n\nIn this role, you will define the architectural vision for Azure services, working closely with product managers and engineering leads to translate customer needs into scalable technical solutions. You will conduct architecture reviews, establish best practices, and ensure consistency across service boundaries.\n\nYou will represent your team in cross-org technical discussions and contribute to long-term platform strategy. Strong written and verbal communication skills are essential as you will regularly present to senior leadership.\n\nIdeal candidates have deep expertise in cloud-native design patterns, microservices, and enterprise integration scenarios.',
        'required_skills': 'Azure, C#, .NET, Microservices, System Design'
    },
    {
        'id': 3,
        'company': 'Meta',
        'position': 'Full Stack Engineer',
        'location': 'Menlo Park, CA',
        'salary': '$155,000 - $195,000',
        'description': 'Meta\'s Growth team is seeking a Full Stack Engineer to build high-impact features that improve how people connect and share on Facebook and Instagram.\n\nYou will own features end-to-end, from backend API design to polished user interfaces. Working in a fast-paced environment, you\'ll run experiments, analyze results, and iterate quickly based on data. Our team ships to billions of users, so performance and reliability are top priorities.\n\nYou\'ll work closely with product designers and data scientists to craft experiences that delight users. We use React on the frontend and a mix of Python and Hack on the backend, with GraphQL connecting the two.\n\nWe value engineers who are product-minded, move quickly, and are comfortable with ambiguity.',
        'required_skills': 'React, Python, GraphQL, SQL, A/B Testing'
    },
    {
        'id': 4,
        'company': 'Amazon',
        'position': 'Software Development Engineer II',
        'location': 'Seattle, WA (Hybrid)',
        'salary': '$145,000 - $185,000',
        'description': 'Amazon\'s Payments team is hiring a Software Development Engineer to help build the payment processing infrastructure that powers Amazon\'s global marketplace.\n\nYou will design and implement services that handle millions of transactions per day with extremely high availability and fault-tolerance requirements. You\'ll own your services through the full SDLC — writing design documents, coding, testing, deploying, and monitoring in production.\n\nOur team operates with a high degree of autonomy and follows a two-pizza team model. You\'ll be expected to lead technical discussions, make architectural decisions, and deliver complex projects on time.\n\nStrong candidates will have experience with high-throughput distributed systems, operational excellence, and a track record of building robust production services.',
        'required_skills': 'Java, AWS, DynamoDB, SQS, Distributed Systems'
    },
    {
        'id': 5,
        'company': 'Apple',
        'position': 'iOS Software Engineer',
        'location': 'Cupertino, CA',
        'salary': '$150,000 - $190,000',
        'description': 'Apple\'s Health team is looking for a talented iOS Software Engineer to help build health and wellness features used by millions of Apple Watch and iPhone users.\n\nYou will work on the HealthKit framework and Health app, building features that help users understand and improve their health. Your work will have a direct impact on people\'s lives, from fitness tracking to clinical health records integration.\n\nYou\'ll collaborate with hardware teams, machine learning engineers, and UX designers to deliver seamless and beautiful experiences. We have very high standards for performance, privacy, and reliability — every detail matters at Apple.\n\nIdeal candidates have deep knowledge of Swift and UIKit, a passion for great user experiences, and a strong understanding of privacy-preserving software design.',
        'required_skills': 'Swift, Objective-C, UIKit, CoreData, HealthKit'
    },
    {
        'id': 6,
        'company': 'Netflix',
        'position': 'Senior Data Engineer',
        'location': 'Los Gatos, CA (Remote)',
        'salary': '$165,000 - $210,000',
        'description': 'Netflix\'s Data Platform team is seeking a Senior Data Engineer to help build and scale the infrastructure that powers content and member analytics across one of the world\'s largest streaming services.\n\nYou will design and maintain data pipelines, data warehouses, and real-time streaming systems that process petabytes of data daily. Your work will directly enable data-driven decision-making across engineering, content, marketing, and product teams.\n\nThe ideal candidate is comfortable working across the full data stack — from ingestion and storage to transformation and serving. We use Apache Spark, Kafka, Flink, and a custom internal platform called Metacat for data discovery and governance.\n\nWe look for engineers who are strong communicators, can influence data infrastructure decisions at scale, and care deeply about data quality and reliability.',
        'required_skills': 'Apache Spark, Kafka, Python, SQL, Scala, Data Modeling'
    },
    {
        'id': 7,
        'company': 'Stripe',
        'position': 'Backend Engineer – Payments',
        'location': 'San Francisco, CA (Remote)',
        'salary': '$155,000 - $200,000',
        'description': 'Stripe is looking for a Backend Engineer to join the Payments team, where you\'ll help build the financial infrastructure that millions of businesses rely on to accept payments globally.\n\nYou will work on the critical path of payment processing, building reliable, low-latency APIs and internal services. Our systems need to handle complex financial logic, fraud prevention, and reconciliation across hundreds of payment methods and currencies.\n\nYou\'ll participate in technical design discussions, write clean and maintainable Ruby or Go code, and take pride in operational excellence. Stripe engineers own their code in production, participating in on-call rotations and driving down error rates.\n\nWe care deeply about correctness and reliability — errors in payments have real financial consequences for our users.',
        'required_skills': 'Ruby, Go, PostgreSQL, Redis, REST APIs, Payments Domain'
    },
    {
        'id': 8,
        'company': 'Airbnb',
        'position': 'Machine Learning Engineer',
        'location': 'San Francisco, CA (Hybrid)',
        'salary': '$160,000 - $205,000',
        'description': 'Airbnb\'s AI & ML team is hiring a Machine Learning Engineer to build and deploy models that improve guest and host experiences across our marketplace.\n\nYou\'ll work on search ranking, pricing optimization, fraud detection, and personalization systems that directly impact revenue and trust on the platform. You\'ll collaborate with data scientists to take models from experimentation to production, building the infrastructure needed to train, evaluate, deploy, and monitor ML systems at scale.\n\nOur ML platform is built on Python, PyTorch, and Airflow for orchestration, with real-time serving via our internal feature store. You\'ll own the reliability and performance of models in production and continuously improve them.\n\nStrong candidates will have experience bridging research and engineering, with a track record of shipping impactful ML features.',
        'required_skills': 'Python, PyTorch, Spark, Airflow, Feature Engineering, MLOps'
    },
    {
        'id': 9,
        'company': 'Salesforce',
        'position': 'Senior Frontend Engineer',
        'location': 'San Francisco, CA (Hybrid)',
        'salary': '$140,000 - $175,000',
        'description': 'Salesforce\'s Lightning Platform team is seeking a Senior Frontend Engineer to help build the next generation of our enterprise CRM user interface used by over 150,000 companies worldwide.\n\nYou will architect and implement complex UI components, improve performance, and ensure accessibility across the Lightning Design System. Working at enterprise scale means solving unique challenges around component reuse, theming, and backwards compatibility.\n\nYou will mentor junior engineers, lead frontend architecture discussions, and establish coding standards. You\'ll partner closely with UX designers to translate designs into pixel-perfect, performant implementations.\n\nWe are looking for engineers with a deep knowledge of modern JavaScript, component architecture patterns, and a strong commitment to web standards and accessibility.',
        'required_skills': 'JavaScript, React, LWC, Web Components, CSS, Accessibility'
    },
    {
        'id': 10,
        'company': 'Spotify',
        'position': 'Backend Engineer – Music Discovery',
        'location': 'New York, NY (Hybrid)',
        'salary': '$135,000 - $170,000',
        'description': 'Spotify\'s Music Discovery squad is looking for a Backend Engineer to help power the recommendation and discovery features that connect 600 million users with music they love.\n\nYou\'ll build APIs and backend services that feed our recommendation engine, playlist generators, and editorial tools. Working on a cross-functional squad with data scientists, ML engineers, and designers, you\'ll have end-to-end ownership of discovery features.\n\nOur backend stack uses Java and Python microservices deployed on GCP with a heavy emphasis on event-driven architecture via Kafka. You\'ll engage in technical planning, lead the design of new services, and contribute to our open source ecosystem.\n\nWe value autonomy, creativity, and the belief that technology can make the world a better place through music.',
        'required_skills': 'Java, Python, Kafka, GCP, Microservices, SQL'
    },
    {
        'id': 11,
        'company': 'LinkedIn',
        'position': 'Staff Engineer – Feed Infrastructure',
        'location': 'Sunnyvale, CA',
        'salary': '$200,000 - $250,000',
        'description': 'LinkedIn is seeking a Staff Engineer to lead technical strategy for Feed Infrastructure, the backbone powering the LinkedIn feed for over 1 billion members.\n\nAs a Staff Engineer, you will drive large-scale technical initiatives, define the multi-year roadmap for feed architecture, and mentor senior engineers across two or more teams. You\'ll represent engineering in product strategy discussions and make critical decisions on latency, reliability, and scalability.\n\nYou will lead the development of stream processing pipelines, caching strategies, and real-time ranking systems that handle millions of feed refreshes per minute. This is a high-impact, high-visibility role at the intersection of infrastructure and product.\n\nSuccessful candidates will have a proven track record of leading large cross-functional engineering projects, strong communication skills, and technical depth across distributed systems.',
        'required_skills': 'Java, Kafka, Espresso, REST, Distributed Systems, Technical Leadership'
    },
    {
        'id': 12,
        'company': 'Uber',
        'position': 'Platform Engineer – Developer Experience',
        'location': 'San Francisco, CA',
        'salary': '$145,000 - $185,000',
        'description': 'Uber\'s Developer Experience team is hiring a Platform Engineer to improve the tools and workflows used by thousands of engineers building Uber\'s global platform.\n\nYou\'ll work on internal developer platforms, CI/CD pipelines, build systems, and developer tooling that directly improve engineering productivity. Your goal is to make every Uber engineer\'s day better — faster build times, better testing frameworks, smoother deployments.\n\nYou\'ll own critical internal infrastructure and be the technical lead on projects to reduce toil and increase developer velocity. Strong knowledge of containerization, build orchestration, and observability is essential.\n\nWe\'re looking for people who are passionate about developer experience, empathetic to fellow engineers\' pain points, and skilled at building internal platforms that scale.',
        'required_skills': 'Go, Kubernetes, Bazel, CI/CD, Docker, Observability'
    },
    {
        'id': 13,
        'company': 'Twilio',
        'position': 'Software Engineer – Communications APIs',
        'location': 'Remote (US)',
        'salary': '$130,000 - $165,000',
        'description': 'Twilio is hiring a Software Engineer to join the Core Communications team, building the SMS, Voice, and WhatsApp APIs used by over 300,000 businesses to communicate with their customers.\n\nYou will design and implement features for our communications platform, ensuring ultra-high availability and global reach. You\'ll work across the stack — from low-level telecom integrations to high-level API design — and contribute to the reliability of services that millions of end users depend on every day.\n\nCode quality and testing are a major focus for our team. You\'ll write comprehensive unit and integration tests, participate in thorough code reviews, and cultivate a culture of engineering excellence.\n\nWe believe in empowering every developer to build better communications. If you\'re excited about APIs, distributed systems, and real-world impact, we\'d love to hear from you.',
        'required_skills': 'Python, Node.js, REST APIs, PostgreSQL, Kafka, AWS'
    }
]
applications = {}
app_id_counter = [1]  # mutable counter

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username in users:
        return jsonify({'message': 'User already exists'}), 400
    
    users[username] = {
        'password_hash': generate_password_hash(password),
        'id': len(users) + 1
    }
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username in users:
        if check_password_hash(users[username]['password_hash'], password):
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
    return jsonify(jobs), 200

@app.route('/apply/<int:job_id>', methods=['POST'])
@jwt_required()
def apply_job(job_id):
    current_user = get_jwt_identity()
    
    if job_id not in applications:
        applications[job_id] = []
    
    if current_user not in [a['user'] for a in applications[job_id]]:
        new_id = app_id_counter[0]
        app_id_counter[0] += 1
        applications[job_id].append({
            'id': new_id,
            'user': current_user,
            'status': 'applied',
            'date_applied': datetime.utcnow().isoformat()
        })
        return jsonify({'message': 'Applied successfully', 'id': new_id}), 201
    
    return jsonify({'message': 'Already applied'}), 400

@app.route('/applications', methods=['GET'])
@jwt_required()
def get_applications():
    current_user = get_jwt_identity()
    user_apps = []
    
    for job_id, apps_list in applications.items():
        for a in apps_list:
            if a['user'] == current_user:
                job = next((j for j in jobs if j['id'] == job_id), None)
                user_apps.append({
                    'id': a['id'],
                    'job_id': job_id,
                    'status': a['status'],
                    'date_applied': a['date_applied'],
                    'listing': job
                })
    
    return jsonify(user_apps), 200

@app.route('/applications/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_application(app_id):
    current_user = get_jwt_identity()
    data = request.get_json()
    new_status = data.get('status')
    
    for apps_list in applications.values():
        for a in apps_list:
            if a['id'] == app_id and a['user'] == current_user:
                a['status'] = new_status
                return jsonify({'message': 'Status updated'}), 200
    
    return jsonify({'message': 'Application not found'}), 404

@app.route('/applications/<int:app_id>', methods=['DELETE'])
@jwt_required()
def delete_application(app_id):
    current_user = get_jwt_identity()
    
    for job_id, apps_list in applications.items():
        for a in apps_list:
            if a['id'] == app_id and a['user'] == current_user:
                applications[job_id].remove(a)
                return jsonify({'message': 'Application deleted'}), 200
    
    return jsonify({'message': 'Application not found'}), 404

@app.route('/insights', methods=['GET'])
@jwt_required()
def get_insights():
    current_user = get_jwt_identity()
    user_apps = []
    
    for apps_list in applications.values():
        for a in apps_list:
            if a['user'] == current_user:
                user_apps.append(a)
    
    total = len(user_apps)
    applied = sum(1 for a in user_apps if a['status'] == 'applied')
    interviews = sum(1 for a in user_apps if a['status'] == 'interview')
    hired = sum(1 for a in user_apps if a['status'] == 'hired')
    success_rate = round((hired / total * 100), 1) if total > 0 else 0
    
    return jsonify({
        'total_applications': total,
        'applied': applied,
        'interviews': interviews,
        'rejected': sum(1 for a in user_apps if a['status'] == 'rejected'),
        'success_rate': success_rate
    }), 200

@app.route('/review_resume', methods=['POST'])
@jwt_required()
def review_resume():
    return jsonify({'feedback': 'Resume review feature coming soon'}), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'message': 'Server error'}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, port=5000)
