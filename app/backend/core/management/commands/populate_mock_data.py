from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.files.base import ContentFile
from core.models import (
    RegisteredUser, Task, TaskCategory, TaskStatus, Volunteer, VolunteerStatus,
    TaskReport, UserReport, ReportType, ReportStatus, Comment, Review, UserFollows
)
from datetime import timedelta
import random
from PIL import Image, ImageDraw, ImageFont
import io


class Command(BaseCommand):
    help = 'Populate database with comprehensive mock data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting mock data population...')
        
        # Create users
        users = self.create_users()
        self.stdout.write(self.style.SUCCESS(f'Created {len(users)} users'))
        
        # Create follows
        self.create_follows(users)
        self.stdout.write(self.style.SUCCESS('Created user follows'))
        
        # Create tasks
        tasks = self.create_tasks(users)
        self.stdout.write(self.style.SUCCESS(f'Created {len(tasks)} tasks'))
        
        # Create volunteers
        self.create_volunteers(users, tasks)
        self.stdout.write(self.style.SUCCESS('Created volunteers'))
        
        # Create comments
        self.create_comments(users, tasks)
        self.stdout.write(self.style.SUCCESS('Created comments'))
        
        # Create reviews
        self.create_reviews(users, tasks)
        self.stdout.write(self.style.SUCCESS('Created reviews'))
        
        # Create reports
        self.create_reports(users, tasks)
        self.stdout.write(self.style.SUCCESS('Created reports'))
        
        self.stdout.write(self.style.SUCCESS('Mock data population completed!'))

    def generate_profile_photo(self, name, color):
        """Generate a simple profile photo with initials"""
        size = (200, 200)
        image = Image.new('RGB', size, color)
        draw = ImageDraw.Draw(image)
        
        # Try to use a font, fallback to default if not available
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 80)
        except:
            font = ImageFont.load_default()
        
        # Get initials
        initials = ''.join([n[0].upper() for n in name.split()[:2]])
        
        # Calculate text position for centering
        bbox = draw.textbbox((0, 0), initials, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        position = ((size[0] - text_width) / 2, (size[1] - text_height) / 2 - 10)
        
        # Draw text
        draw.text(position, initials, fill='white', font=font)
        
        # Save to bytes
        img_io = io.BytesIO()
        image.save(img_io, format='PNG')
        img_io.seek(0)
        
        return ContentFile(img_io.read(), name=f'{name.replace(" ", "_")}.png')

    def generate_task_photo(self, category, index):
        """Generate a task photo based on category"""
        size = (400, 300)
        
        # Category-based colors
        category_colors = {
            'GROCERY_SHOPPING': '#4CAF50',
            'TUTORING': '#2196F3',
            'HOME_REPAIR': '#FF9800',
            'MOVING_HELP': '#9C27B0',
            'HOUSE_CLEANING': '#00BCD4',
            'OTHER': '#607D8B',
        }
        
        color = category_colors.get(category, '#607D8B')
        image = Image.new('RGB', size, color)
        draw = ImageDraw.Draw(image)
        
        # Add category text
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
        except:
            font = ImageFont.load_default()
        
        category_name = category.replace('_', ' ')
        bbox = draw.textbbox((0, 0), category_name, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        position = ((size[0] - text_width) / 2, (size[1] - text_height) / 2)
        
        draw.text(position, category_name, fill='white', font=font)
        
        # Save to bytes
        img_io = io.BytesIO()
        image.save(img_io, format='PNG')
        img_io.seek(0)
        
        return ContentFile(img_io.read(), name=f'{category}_{index}.png')

    def create_users(self):
        """Create diverse set of users with Turkish and English names"""
        users_data = [
            # Turkish users
            {'name': 'Ahmet', 'surname': 'Yılmaz', 'username': 'ahmetyilmaz', 'location': 'Kadıköy, İstanbul'},
            {'name': 'Ayşe', 'surname': 'Demir', 'username': 'aysedemir', 'location': 'Beşiktaş, İstanbul'},
            {'name': 'Mehmet', 'surname': 'Kaya', 'username': 'mehmetkaya', 'location': 'Şişli, İstanbul'},
            {'name': 'Fatma', 'surname': 'Şahin', 'username': 'fatmasahin', 'location': 'Üsküdar, İstanbul'},
            {'name': 'Ali', 'surname': 'Öztürk', 'username': 'aliozturk', 'location': 'Beyoğlu, İstanbul'},
            {'name': 'Zeynep', 'surname': 'Çelik', 'username': 'zeynepcelik', 'location': 'Sarıyer, İstanbul'},
            {'name': 'Mustafa', 'surname': 'Aydın', 'username': 'mustafaaydin', 'location': 'Bakırköy, İstanbul'},
            {'name': 'Elif', 'surname': 'Kurt', 'username': 'elifkurt', 'location': 'Maltepe, İstanbul'},
            {'name': 'Emre', 'surname': 'Arslan', 'username': 'emrearslan', 'location': 'Ataşehir, İstanbul'},
            {'name': 'Selin', 'surname': 'Yıldız', 'username': 'selinyildiz', 'location': 'Kartal, İstanbul'},
            {'name': 'Burak', 'surname': 'Doğan', 'username': 'burakdogan', 'location': 'Pendik, İstanbul'},
            {'name': 'Deniz', 'surname': 'Koç', 'username': 'denizkoc', 'location': 'Beykoz, İstanbul'},
            {'name': 'Can', 'surname': 'Arslan', 'username': 'canarslan', 'location': 'Eyüpsultan, İstanbul'},
            {'name': 'Merve', 'surname': 'Güneş', 'username': 'mervegunes', 'location': 'Gaziosmanpaşa, İstanbul'},
            {'name': 'Cem', 'surname': 'Polat', 'username': 'cempolat', 'location': 'Kağıthane, İstanbul'},
            {'name': 'Hakan', 'surname': 'Yurt', 'username': 'hakanyurt', 'location': 'Fatih, İstanbul'},
            {'name': 'Gül', 'surname': 'Erdoğan', 'username': 'gulerdogan', 'location': 'Sultangazi, İstanbul'},
            {'name': 'Oğuz', 'surname': 'Bal', 'username': 'oguzbal', 'location': 'Esenler, İstanbul'},
            {'name': 'Işık', 'surname': 'Tekin', 'username': 'isiktekin', 'location': 'Küçükçekmece, İstanbul'},
            {'name': 'Arda', 'surname': 'Mutlu', 'username': 'ardamutlu', 'location': 'Başakşehir, İstanbul'},
            
            # English-speaking users
            {'name': 'John', 'surname': 'Smith', 'username': 'johnsmith', 'location': 'Kadıköy, İstanbul'},
            {'name': 'Emma', 'surname': 'Johnson', 'username': 'emmajohnson', 'location': 'Beşiktaş, İstanbul'},
            {'name': 'Michael', 'surname': 'Brown', 'username': 'michaelbrown', 'location': 'Şişli, İstanbul'},
            {'name': 'Sarah', 'surname': 'Davis', 'username': 'sarahdavis', 'location': 'Beyoğlu, İstanbul'},
            {'name': 'David', 'surname': 'Wilson', 'username': 'davidwilson', 'location': 'Sarıyer, İstanbul'},
            {'name': 'Emily', 'surname': 'Taylor', 'username': 'emilytaylor', 'location': 'Üsküdar, İstanbul'},
            {'name': 'James', 'surname': 'Anderson', 'username': 'jamesanderson', 'location': 'Bakırköy, İstanbul'},
            {'name': 'Lisa', 'surname': 'Thomas', 'username': 'lisathomas', 'location': 'Maltepe, İstanbul'},
            {'name': 'Robert', 'surname': 'Martinez', 'username': 'robertmartinez', 'location': 'Ataşehir, İstanbul'},
            {'name': 'Jennifer', 'surname': 'Garcia', 'username': 'jennifergarcia', 'location': 'Kartal, İstanbul'},
            {'name': 'William', 'surname': 'Rodriguez', 'username': 'williamrodriguez', 'location': 'Pendik, İstanbul'},
            {'name': 'Jessica', 'surname': 'Lee', 'username': 'jessicalee', 'location': 'Beykoz, İstanbul'},
            {'name': 'Daniel', 'surname': 'White', 'username': 'danielwhite', 'location': 'Eyüpsultan, İstanbul'},
            {'name': 'Amanda', 'surname': 'Harris', 'username': 'amandaharris', 'location': 'Fatih, İstanbul'},
            {'name': 'Christopher', 'surname': 'Clark', 'username': 'christopherclark', 'location': 'Sultangazi, İstanbul'},
            {'name': 'Matthew', 'surname': 'Lewis', 'username': 'matthewlewis', 'location': 'Esenler, İstanbul'},
            {'name': 'Ashley', 'surname': 'Walker', 'username': 'ashleywalker', 'location': 'Küçükçekmece, İstanbul'},
            {'name': 'Andrew', 'surname': 'Hall', 'username': 'andrewhall', 'location': 'Başakşehir, İstanbul'},
            {'name': 'Stephanie', 'surname': 'Allen', 'username': 'stephanieallen', 'location': 'Büyükçekmece, İstanbul'},
            {'name': 'Joshua', 'surname': 'Young', 'username': 'joshuayoung', 'location': 'Bahçelievler, İstanbul'},
        ]
        
        colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
            '#E63946', '#F77F00', '#06AED5', '#073B4C', '#EF476F'
        ]
        
        users = []
        for i, user_data in enumerate(users_data):
            email = f"{user_data['username']}@example.com"
            phone = f"+90555{random.randint(1000000, 9999999)}"
            
            # Skip if user already exists
            if RegisteredUser.objects.filter(email=email).exists():
                users.append(RegisteredUser.objects.get(email=email))
                continue
            
            user = RegisteredUser.objects.create_user(
                email=email,
                name=user_data['name'],
                surname=user_data['surname'],
                username=user_data['username'],
                phone_number=phone,
                password='Password123!',
                location=user_data['location'],
                rating=round(random.uniform(3.5, 5.0), 1),
                completed_task_count=random.randint(0, 25)
            )
            
            # Generate and attach profile photo
            color = colors[i % len(colors)]
            photo = self.generate_profile_photo(f"{user_data['name']} {user_data['surname']}", color)
            user.profile_photo.save(f"{user_data['username']}.png", photo, save=True)
            
            users.append(user)
        
        return users

    def create_follows(self, users):
        """Create follow relationships between users"""
        for user in users[:20]:  # First 20 users follow others
            # Each user follows 3-8 random other users
            num_follows = random.randint(3, 8)
            potential_follows = [u for u in users if u != user]
            to_follow = random.sample(potential_follows, min(num_follows, len(potential_follows)))
            
            for followed_user in to_follow:
                UserFollows.objects.get_or_create(
                    follower=user,
                    following=followed_user
                )

    def create_tasks(self, users):
        """Create diverse tasks in Turkish and English"""
        
        # Turkish tasks
        turkish_tasks = [
            {
                'title': 'Market alışverişi yardımı',
                'description': 'Yaşlı annem için haftalık market alışverişi yapacak birini arıyorum. Migros\'tan temel ihtiyaç maddeleri alınacak.',
                'category': TaskCategory.GROCERY_SHOPPING,
                'location': 'Kadıköy, İstanbul',
                'requirements': 'Araba sahibi olmak tercih sebebi'
            },
            {
                'title': 'İngilizce özel ders',
                'description': 'Lise sınavlarına hazırlanan çocuğum için haftada 2 gün İngilizce dersi verecek öğretmen arıyorum.',
                'category': TaskCategory.TUTORING,
                'location': 'Beşiktaş, İstanbul',
                'requirements': 'Eğitim fakültesi mezunu veya öğrencisi'
            },
            {
                'title': 'Musluk tamiri',
                'description': 'Mutfak musluğu damlıyor, tamir edilmesi gerekiyor. Malzemeler mevcut, sadece montaj için yardım lazım.',
                'category': TaskCategory.HOME_REPAIR,
                'location': 'Şişli, İstanbul',
                'requirements': 'Temel tesisat bilgisi'
            },
            {
                'title': 'Ev taşıma yardımı',
                'description': 'Bu hafta sonu yeni evime taşınacağım. Mobilyaları taşımak için 2-3 kişiye ihtiyacım var.',
                'category': TaskCategory.MOVING_HELP,
                'location': 'Üsküdar, İstanbul',
                'requirements': 'Fiziksel olarak güçlü olmak'
            },
            {
                'title': 'Ev temizliği',
                'description': 'Haftalık ev temizliği için yardım arıyorum. 3+1 daire, yaklaşık 3-4 saat sürer.',
                'category': TaskCategory.HOUSE_CLEANING,
                'location': 'Beyoğlu, İstanbul',
                'requirements': 'Temizlik tecrübesi'
            },
            {
                'title': 'Matematik özel ders',
                'description': 'Üniversite sınavına hazırlanan öğrencim için matematik dersi. Haftada 3 gün.',
                'category': TaskCategory.TUTORING,
                'location': 'Sarıyer, İstanbul',
                'requirements': 'Matematik öğretmeni veya mühendis'
            },
            {
                'title': 'Bahçe düzenleme',
                'description': 'Bahçemde küçük çapta çiçek ekimi ve bakım işleri için yardım lazım.',
                'category': TaskCategory.OTHER,
                'location': 'Bakırköy, İstanbul',
                'requirements': 'Bitki bakımı konusunda bilgi'
            },
            {
                'title': 'Bilgisayar kurulumu',
                'description': 'Yeni aldığım masaüstü bilgisayarın kurulumu ve yazılım yüklemesi için teknik destek.',
                'category': TaskCategory.OTHER,
                'location': 'Maltepe, İstanbul',
                'requirements': 'Bilgisayar donanım bilgisi'
            },
            {
                'title': 'Perde asma',
                'description': 'Salon ve yatak odası için yeni aldığım perdelerin asılması gerekiyor.',
                'category': TaskCategory.HOME_REPAIR,
                'location': 'Ataşehir, İstanbul',
                'requirements': 'Matkap kullanabilmek'
            },
            {
                'title': 'Köpek gezdirme',
                'description': 'Bu hafta tatildeyken her gün sabah akşam köpeğimi gezdirecek hayvan sever birini arıyorum.',
                'category': TaskCategory.OTHER,
                'location': 'Kartal, İstanbul',
                'requirements': 'Köpekleri sevmek ve deneyim'
            },
            {
                'title': 'Fen bilgisi dersi',
                'description': 'Ortaokul öğrencim için fen bilgisi derslerinde destek arıyorum.',
                'category': TaskCategory.TUTORING,
                'location': 'Pendik, İstanbul',
                'requirements': 'Fen bilgisi öğretmeni'
            },
            {
                'title': 'Boyama işi',
                'description': 'Çocuk odasının duvarlarını boyatacağım. Boya ve malzeme mevcut.',
                'category': TaskCategory.HOME_REPAIR,
                'location': 'Beykoz, İstanbul',
                'requirements': 'Boya işinden anlayan'
            },
            {
                'title': 'Beyaz eşya taşıma',
                'description': 'Buzdolabı ve çamaşır makinesinin başka kata taşınması gerekiyor.',
                'category': TaskCategory.MOVING_HELP,
                'location': 'Eyüpsultan, İstanbul',
                'requirements': '2 kişi gerekli'
            },
            {
                'title': 'Alışveriş yardımı - yaşlı',
                'description': 'Evden çıkamayan babam için eczane ve market alışverişi.',
                'category': TaskCategory.GROCERY_SHOPPING,
                'location': 'Gaziosmanpaşa, İstanbul',
                'requirements': 'Güvenilir ve nazik olmak'
            },
            {
                'title': 'Ofis temizliği',
                'description': 'Küçük ofisimizin haftalık temizliği için yardım arıyoruz.',
                'category': TaskCategory.HOUSE_CLEANING,
                'location': 'Kağıthane, İstanbul',
                'requirements': 'Profesyonel temizlik deneyimi'
            },
            {
                'title': 'Türkçe dersi',
                'description': 'Yabancı arkadaşım için Türkçe konuşma pratiği yapacak birini arıyorum.',
                'category': TaskCategory.TUTORING,
                'location': 'Büyükçekmece, İstanbul',
                'requirements': 'Sabırlı ve iletişimi güçlü'
            },
            {
                'title': 'Klima bakımı',
                'description': 'Klimaların yaz öncesi bakımı ve temizliği için teknisyen arıyorum.',
                'category': TaskCategory.HOME_REPAIR,
                'location': 'Bahçelievler, İstanbul',
                'requirements': 'Klima bakım deneyimi'
            },
            {
                'title': 'Kitap taşıma',
                'description': 'Kütüphanedeki kitapları yeni eve taşımak için yardım lazım.',
                'category': TaskCategory.MOVING_HELP,
                'location': 'Zeytinburnu, İstanbul',
                'requirements': 'Dikkatli ve sabırlı'
            },
            {
                'title': 'Yaşlı bakımı',
                'description': 'Yaşlı babam için günlük kontrol ve sohbet için birkaç saat yardım.',
                'category': TaskCategory.OTHER,
                'location': 'Avcılar, İstanbul',
                'requirements': 'Yaşlı bakımı deneyimi'
            },
        ]
        
        # English tasks
        english_tasks = [
            {
                'title': 'Grocery shopping for elderly',
                'description': 'Need help with weekly grocery shopping for my elderly parents. Basic items from local market.',
                'category': TaskCategory.GROCERY_SHOPPING,
                'location': 'Kadıköy, İstanbul',
                'requirements': 'Patient and kind person preferred'
            },
            {
                'title': 'English tutoring',
                'description': 'Looking for native English speaker to tutor my teenager 2 times per week.',
                'category': TaskCategory.TUTORING,
                'location': 'Beşiktaş, İstanbul',
                'requirements': 'Teaching experience required'
            },
            {
                'title': 'Plumbing repair',
                'description': 'Kitchen sink is leaking and needs repair. Materials available, just need installation help.',
                'category': TaskCategory.HOME_REPAIR,
                'location': 'Şişli, İstanbul',
                'requirements': 'Basic plumbing knowledge'
            },
            {
                'title': 'Moving assistance needed',
                'description': 'Moving to a new apartment this weekend. Need 2-3 people to help with furniture.',
                'category': TaskCategory.MOVING_HELP,
                'location': 'Beyoğlu, İstanbul',
                'requirements': 'Physically fit'
            },
            {
                'title': 'House cleaning',
                'description': 'Weekly house cleaning needed. 3 bedroom apartment, takes about 3-4 hours.',
                'category': TaskCategory.HOUSE_CLEANING,
                'location': 'Sarıyer, İstanbul',
                'requirements': 'Cleaning experience'
            },
            {
                'title': 'Math tutoring',
                'description': 'Need math tutor for university entrance exam preparation. 3 days a week.',
                'category': TaskCategory.TUTORING,
                'location': 'Üsküdar, İstanbul',
                'requirements': 'Math teacher or engineer'
            },
            {
                'title': 'Garden maintenance',
                'description': 'Need help with planting flowers and basic garden maintenance.',
                'category': TaskCategory.OTHER,
                'location': 'Bakırköy, İstanbul',
                'requirements': 'Knowledge of plant care'
            },
            {
                'title': 'Computer setup help',
                'description': 'Need technical support for setting up new desktop computer and installing software.',
                'category': TaskCategory.OTHER,
                'location': 'Maltepe, İstanbul',
                'requirements': 'Computer hardware knowledge'
            },
            {
                'title': 'Curtain installation',
                'description': 'Need to install new curtains in living room and bedroom.',
                'category': TaskCategory.HOME_REPAIR,
                'location': 'Ataşehir, İstanbul',
                'requirements': 'Able to use drill'
            },
            {
                'title': 'Dog walking service',
                'description': 'Need someone to walk my dog twice daily while I\'m on vacation this week.',
                'category': TaskCategory.OTHER,
                'location': 'Kartal, İstanbul',
                'requirements': 'Love dogs and have experience'
            },
            {
                'title': 'Science tutoring',
                'description': 'Looking for science tutor for middle school student.',
                'category': TaskCategory.TUTORING,
                'location': 'Pendik, İstanbul',
                'requirements': 'Science teacher'
            },
            {
                'title': 'Room painting',
                'description': 'Need to paint children\'s room. Paint and materials available.',
                'category': TaskCategory.HOME_REPAIR,
                'location': 'Beykoz, İstanbul',
                'requirements': 'Painting experience'
            },
            {
                'title': 'Appliance moving',
                'description': 'Need to move refrigerator and washing machine to another floor.',
                'category': TaskCategory.MOVING_HELP,
                'location': 'Eyüpsultan, İstanbul',
                'requirements': '2 people needed'
            },
            {
                'title': 'Shopping for elderly',
                'description': 'Pharmacy and grocery shopping for my homebound father.',
                'category': TaskCategory.GROCERY_SHOPPING,
                'location': 'Fatih, İstanbul',
                'requirements': 'Reliable and kind'
            },
            {
                'title': 'Office cleaning',
                'description': 'Looking for help with weekly cleaning of small office.',
                'category': TaskCategory.HOUSE_CLEANING,
                'location': 'Sultangazi, İstanbul',
                'requirements': 'Professional cleaning experience'
            },
            {
                'title': 'Turkish language lessons',
                'description': 'Looking for someone to practice Turkish conversation with my foreign friend.',
                'category': TaskCategory.TUTORING,
                'location': 'Büyükçekmece, İstanbul',
                'requirements': 'Patient and good communicator'
            },
            {
                'title': 'AC maintenance',
                'description': 'Need technician for AC maintenance and cleaning before summer.',
                'category': TaskCategory.HOME_REPAIR,
                'location': 'Bahçelievler, İstanbul',
                'requirements': 'AC maintenance experience'
            },
            {
                'title': 'Book moving',
                'description': 'Need help moving books from library to new house.',
                'category': TaskCategory.MOVING_HELP,
                'location': 'Zeytinburnu, İstanbul',
                'requirements': 'Careful and patient'
            },
            {
                'title': 'Elderly care',
                'description': 'Need a few hours of daily checkup and conversation for my elderly father.',
                'category': TaskCategory.OTHER,
                'location': 'Avcılar, İstanbul',
                'requirements': 'Elderly care experience'
            },
            {
                'title': 'Guitar lessons',
                'description': 'Looking for guitar teacher for beginner level. 2 times per week.',
                'category': TaskCategory.TUTORING,
                'location': 'Kadıköy, İstanbul',
                'requirements': 'Guitar teaching experience'
            },
            {
                'title': 'Furniture assembly',
                'description': 'Need help assembling IKEA furniture (bed, wardrobe, shelves).',
                'category': TaskCategory.HOME_REPAIR,
                'location': 'Beşiktaş, İstanbul',
                'requirements': 'Experience with furniture assembly'
            },
            {
                'title': 'Pet sitting',
                'description': 'Need someone to take care of my cat while I\'m away for a week.',
                'category': TaskCategory.OTHER,
                'location': 'Şişli, İstanbul',
                'requirements': 'Love cats and have experience'
            },
        ]
        
        all_tasks_data = turkish_tasks + english_tasks
        tasks = []
        
        for i, task_data in enumerate(all_tasks_data):
            creator = random.choice(users)
            
            # Randomly set deadline (between 10 days ago to 30 days from now)
            days_offset = random.randint(-10, 30)
            deadline = timezone.now() + timedelta(days=days_offset)
            
            # Set status based on deadline
            if days_offset < -3:
                # Tasks that are well past deadline - mostly completed
                status = random.choices(
                    [TaskStatus.COMPLETED, TaskStatus.EXPIRED, TaskStatus.CANCELLED],
                    weights=[7, 2, 1]  # 70% completed, 20% expired, 10% cancelled
                )[0]
            elif days_offset < 0:
                # Recently past deadline - some completed, some in various states
                status = random.choices(
                    [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
                    weights=[5, 3, 2]  # 50% completed, 30% in progress, 20% cancelled
                )[0]
            elif days_offset < 7:
                # Near future - active tasks
                status = random.choice([TaskStatus.POSTED, TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS])
            else:
                status = TaskStatus.POSTED
            
            task = Task.objects.create(
                title=task_data['title'],
                description=task_data['description'],
                category=task_data['category'],
                location=task_data['location'],
                deadline=deadline,
                requirements=task_data['requirements'],
                urgency_level=random.randint(1, 5),
                volunteer_number=random.randint(1, 3),
                status=status,
                creator=creator,
                is_recurring=random.choice([True, False]) if random.random() < 0.2 else False
            )
            
            # Add task photo
            from core.models import Photo
            task_photo = self.generate_task_photo(task_data['category'], i)
            photo = Photo.objects.create(
                task=task
            )
            photo.url.save(f'task_{i}.png', task_photo, save=True)
            
            tasks.append(task)
        
        return tasks

    def create_volunteers(self, users, tasks):
        """Create volunteer applications for tasks"""
        for task in tasks:
            # Skip if task is cancelled or expired
            if task.status in [TaskStatus.CANCELLED, TaskStatus.EXPIRED]:
                continue
            
            # Completed and in-progress tasks must have at least 1 volunteer
            if task.status in [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS, TaskStatus.ASSIGNED]:
                num_volunteers = random.randint(1, 5)
            else:
                # Other tasks can have 0-5 volunteers
                num_volunteers = random.randint(0, 5)
            
            potential_volunteers = [u for u in users if u != task.creator]
            
            if num_volunteers > 0 and potential_volunteers:
                volunteers = random.sample(
                    potential_volunteers, 
                    min(num_volunteers, len(potential_volunteers))
                )
                
                for i, volunteer_user in enumerate(volunteers):
                    # First volunteer for assigned/in_progress/completed tasks is accepted
                    if i == 0 and task.status in [TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]:
                        status = VolunteerStatus.ACCEPTED
                        task.assignee = volunteer_user
                        task.save()
                    else:
                        status = random.choice([
                            VolunteerStatus.PENDING,
                            VolunteerStatus.ACCEPTED,
                            VolunteerStatus.REJECTED
                        ])
                    
                    Volunteer.objects.create(
                        user=volunteer_user,
                        task=task,
                        status=status
                    )

    def create_comments(self, users, tasks):
        """Create comments on tasks"""
        turkish_comments = [
            'Bu konuda yardımcı olabilirim, deneyimim var.',
            'Ne zaman uygun olur sizin için?',
            'Daha fazla detay verebilir misiniz?',
            'Hala yardım lazım mı?',
            'Benzer bir işi daha önce yaptım, başarıyla tamamlayabilirim.',
            'Hafta sonu müsait miyim acaba?',
            'Çok güzel bir komşuluk yardımı, keşke yardım edebilsem.',
            'Tam da bu konuda uzmanlığım var!',
            'Malzemeler dahil mi yoksa sadece işçilik mi?',
            'Teşekkürler, çok yardımcı oldunuz!',
        ]
        
        english_comments = [
            'I can help with this, I have experience.',
            'When would be convenient for you?',
            'Could you provide more details?',
            'Is help still needed?',
            'I\'ve done similar work before, can complete successfully.',
            'Am I available this weekend?',
            'Such a nice neighborly help, wish I could assist.',
            'I have expertise in exactly this!',
            'Are materials included or just labor?',
            'Thank you, very helpful!',
        ]
        
        all_comments = turkish_comments + english_comments
        
        for task in random.sample(tasks, min(25, len(tasks))):
            # 1-4 comments per task
            num_comments = random.randint(1, 4)
            commenters = random.sample(
                [u for u in users if u != task.creator],
                min(num_comments, len(users) - 1)
            )
            
            for commenter in commenters:
                Comment.objects.create(
                    user=commenter,
                    task=task,
                    content=random.choice(all_comments)
                )

    def create_reviews(self, users, tasks):
        """Create reviews for completed tasks"""
        completed_tasks = [t for t in tasks if t.status == TaskStatus.COMPLETED]
        
        for task in completed_tasks:
            if task.assignee:
                # Requester reviews volunteer
                Review.objects.create(
                    reviewer=task.creator,
                    reviewee=task.assignee,
                    task=task,
                    reliability=round(random.uniform(3.5, 5.0), 1),
                    task_completion=round(random.uniform(3.5, 5.0), 1),
                    communication_requester_to_volunteer=round(random.uniform(3.5, 5.0), 1),
                    safety_and_respect=round(random.uniform(3.5, 5.0), 1),
                    comment=random.choice([
                        'Çok yardımcı oldu, teşekkürler!',
                        'Harika bir iş çıkardı.',
                        'Zamanında geldi ve işini güzel yaptı.',
                        'Great help, thank you!',
                        'Excellent work.',
                        'Came on time and did a great job.',
                    ])
                )
                
                # Volunteer reviews requester
                Review.objects.create(
                    reviewer=task.assignee,
                    reviewee=task.creator,
                    task=task,
                    accuracy_of_request=round(random.uniform(3.5, 5.0), 1),
                    communication_volunteer_to_requester=round(random.uniform(3.5, 5.0), 1),
                    safety_and_preparedness=round(random.uniform(3.5, 5.0), 1),
                    comment=random.choice([
                        'İyi bir deneyimdi.',
                        'Çok nazik ve anlayışlıydı.',
                        'Her şey açıklandığı gibiydi.',
                        'Good experience.',
                        'Very kind and understanding.',
                        'Everything was as described.',
                    ])
                )
                
                # Update user ratings
                task.creator.rating = round(random.uniform(4.0, 5.0), 1)
                task.creator.save()
                task.assignee.rating = round(random.uniform(4.0, 5.0), 1)
                task.assignee.completed_task_count += 1
                task.assignee.save()

    def create_reports(self, users, tasks):
        """Create some reports for users and tasks"""
        # Report some tasks
        tasks_to_report = random.sample(tasks, min(5, len(tasks)))
        
        turkish_report_reasons = [
            'Bu görev sahte görünüyor.',
            'Uygunsuz içerik var.',
            'Kişi randevuya gelmedi.',
            'Dolandırıcılık şüphesi.',
        ]
        
        english_report_reasons = [
            'This task seems fake.',
            'Contains inappropriate content.',
            'Person did not show up.',
            'Suspected fraud.',
        ]
        
        report_reasons = turkish_report_reasons + english_report_reasons
        
        for task in tasks_to_report:
            reporter = random.choice([u for u in users if u != task.creator])
            
            TaskReport.objects.create(
                task=task,
                reporter=reporter,
                report_type=random.choice([
                    ReportType.SPAM,
                    ReportType.INAPPROPRIATE_CONTENT,
                    ReportType.FAKE_REQUEST,
                    ReportType.NO_SHOW
                ]),
                description=random.choice(report_reasons),
                status=random.choice([
                    ReportStatus.PENDING,
                    ReportStatus.UNDER_REVIEW,
                    ReportStatus.RESOLVED
                ])
            )
        
        # Report some users
        users_to_report = random.sample(users, min(3, len(users)))
        
        for reported_user in users_to_report:
            reporter = random.choice([u for u in users if u != reported_user])
            
            UserReport.objects.create(
                reported_user=reported_user,
                reporter=reporter,
                report_type=random.choice([
                    ReportType.HARASSMENT,
                    ReportType.INAPPROPRIATE_CONTENT,
                    ReportType.FRAUD
                ]),
                description=random.choice(report_reasons),
                status=random.choice([
                    ReportStatus.PENDING,
                    ReportStatus.UNDER_REVIEW
                ])
            )
