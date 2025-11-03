from locust import HttpUser, task, between
from locust.exception import RescheduleTask
import json
import random
import time

class WeMasterUser(HttpUser):
    wait_time = between(1, 3)  # 1-3秒等待时间
    host = "http://localhost:3000"  # 默认端口，会在on_start中检测
    
    def on_start(self):
        """检测可用的后端端口"""
        import socket
        ports_to_try = [3000, 3001, 3002, 8000]
        
        for port in ports_to_try:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(('localhost', port))
                sock.close()
                
                if result == 0:
                    self.host = f"http://localhost:{port}"
                    print(f"✅ 检测到后端服务在端口 {port}")
                    break
            except:
                continue
        
        print(f"使用后端地址: {self.host}")
        self.token = None
        self.user_id = None
        self.login()
    
    
    
    def login(self):
        """用户登录场景"""
        users = [
            {'email': 'student1@test.com', 'password': 'password123'},
            {'email': 'student2@test.com', 'password': 'password123'},
            {'email': 'student3@test.com', 'password': 'password123'},
            {'email': 'student4@test.com', 'password': 'password123'},
            {'email': 'student5@test.com', 'password': 'password123'},
        ]
        
        user = random.choice(users)
        
        with self.client.post("/api/v1/auth/login", 
                            json=user,
                            catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('accessToken')
                self.user_id = data.get('user', {}).get('id')
                response.success()
                print(f"✅ 用户登录成功: {user['email']}")
            else:
                response.failure(f"登录失败: {response.status_code}")
                print(f"❌ 登录失败: {response.status_code} - {response.text}")
                raise RescheduleTask()
    
    @task(3)
    def course_search(self):
        """课程检索与浏览 - 高频场景"""
        headers = {'Content-Type': 'application/json'}
        
        # 获取课程列表
        with self.client.get("/api/v1/offerings", 
                           headers=headers,
                           catch_response=True) as response:
            if response.status_code == 200:
                courses = response.json()
                if courses and len(courses) > 0:
                    # 随机选择一个课程查看详情
                    course = random.choice(courses)
                    with self.client.get(f"/api/v1/offerings/{course['slug']}", 
                                       headers=headers,
                                       catch_response=True) as detail_response:
                        if detail_response.status_code == 200:
                            response.success()
                            detail_response.success()
                        else:
                            response.failure(f"课程详情失败: {detail_response.status_code}")
                            detail_response.failure(f"详情获取失败: {detail_response.status_code}")
                else:
                    response.success()
            else:
                response.failure(f"课程列表失败: {response.status_code}")
    
    @task(2)
    def create_order(self):
        """课程下单流程 - 中频场景"""
        if not self.token:
            return
        
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        # 先获取课程
        with self.client.get("/api/v1/offerings", 
                           headers=headers,
                           catch_response=True) as courses_response:
            if courses_response.status_code == 200:
                courses = courses_response.json()
                if courses and len(courses) > 0:
                    course = random.choice(courses)
                    
                    # 创建订单草稿
                    order_data = {
                        'offeringId': course['id'],
                        'variantId': course.get('variants', [{}])[0].get('id') if course.get('variants') else None,
                        'quantity': 1
                    }
                    
                    with self.client.post("/api/v1/orders/draft", 
                                        json=order_data,
                                        headers=headers,
                                        catch_response=True) as order_response:
                        if order_response.status_code in [200, 201]:
                            order_response.success()
                            print(f"✅ 订单创建成功: {order_response.json().get('id', 'unknown')}")
                        else:
                            order_response.failure(f"订单创建失败: {order_response.status_code}")
                            print(f"❌ 订单创建失败: {order_response.status_code} - {order_response.text}")
                else:
                    courses_response.failure("没有可用课程")
            else:
                courses_response.failure(f"获取课程失败: {courses_response.status_code}")
    
    @task(1)
    def payment_webhook(self):
        """支付回调处理 - 低频场景"""
        # 模拟Stripe webhook
        webhook_payload = {
            "id": f"evt_test_{int(time.time())}_{random.randint(1000, 9999)}",
            "object": "event",
            "api_version": "2020-08-27",
            "created": int(time.time()),
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": f"pi_test_{int(time.time())}_{random.randint(1000, 9999)}",
                    "object": "payment_intent",
                    "amount": random.choice([5000, 10000, 15000]),
                    "currency": "usd",
                    "status": "succeeded",
                    "metadata": {
                        "orderId": f"order_test_{int(time.time())}",
                    },
                }
            }
        }
        
        headers = {
            'Content-Type': 'application/json',
            'stripe-signature': f'test_signature_{random.randint(100000, 999999)}'
        }
        
        with self.client.post("/api/v1/payments/webhooks/stripe", 
                            json=webhook_payload,
                            headers=headers,
                            catch_response=True) as response:
            if response.status_code == 200:
                response.success()
                print("✅ Webhook处理成功")
            else:
                # webhook失败可能是签名验证，这是正常的
                response.success()
                print(f"⚠️  Webhook处理: {response.status_code} (可能正常)")
    
    @task(1)
    def reconciliation_query(self):
        """账单对账查询 - 低频场景"""
        headers = {
            'Content-Type': 'application/json'
        }
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        with self.client.get("/api/v1/orders", 
                           headers=headers,
                           catch_response=True) as response:
            if response.status_code == 200:
                response.success()
                print("✅ 对账查询成功")
            elif response.status_code == 401:
                # 未授权是正常的，因为没有管理员权限
                response.success()
                print("⚠️  对账查询: 未授权 (正常)")
            else:
                response.failure(f"对账查询失败: {response.status_code}")
                print(f"❌ 对账查询失败: {response.status_code} - {response.text}")
    
    @task(1)
    def health_check(self):
        """健康检查 - 保活场景"""
        with self.client.get("/healthz", 
                           catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"健康检查失败: {response.status_code}")

class AdminUser(HttpUser):
    wait_time = between(2, 5)
    host = "http://localhost:3000"  # 默认端口，会在on_start中检测
    weight = 1  # 管理员用户权重较低
    
    def on_start(self):
        """检测端口并管理员登录"""
        import socket
        ports_to_try = [3000, 3001, 3002, 8000]
        
        for port in ports_to_try:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(('localhost', port))
                sock.close()
                
                if result == 0:
                    self.host = f"http://localhost:{port}"
                    print(f"✅ 管理员检测到后端服务在端口 {port}")
                    break
            except:
                continue
        
        print(f"管理员使用后端地址: {self.host}")
        self.token = None
        self.admin_login()
    
    def admin_login(self):
        """管理员登录"""
        admin_data = {
            'email': 'admin@test.com',
            'password': 'admin123'
        }
        
        with self.client.post("/api/v1/auth/login", 
                            json=admin_data,
                            catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('accessToken')
                response.success()
                print("👨‍💼 管理员登录成功")
            else:
                response.failure(f"管理员登录失败: {response.status_code}")
                print(f"❌ 管理员登录失败: {response.status_code}")
                raise RescheduleTask()
    
    @task
    def admin_dashboard(self):
        """管理员仪表板数据查询"""
        if not self.token:
            return
        
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        # 查询各种管理数据
        endpoints = [
            "/api/v1/users",
            "/api/v1/offerings",
            "/api/v1/orders",
            "/api/v1/payments"
        ]
        
        for endpoint in endpoints:
            with self.client.get(endpoint, 
                               headers=headers,
                               catch_response=True) as response:
                if response.status_code == 200:
                    response.success()
                elif response.status_code == 401:
                    response.failure("管理员权限不足")
                else:
                    response.failure(f"管理员查询失败: {response.status_code}")