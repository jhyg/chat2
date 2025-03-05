## Run the frontend
```
cd frontend
npm i
npm run serve
```

## Supabase

1. Install Supabase
	macOs		
    ``` 
    brew install supabase/tap/supabase
    brew upgrade supabase
    ```
	windows
    ```
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    scoop install supabase
    scoop update supabase
    ```

2. Start Docker Desktop 

3. Start Supabase
	```
    supabase init
    supabase start
	```

4. Connect Supabase to supabase.js
    - supabaseUrl: {{ API URL }}
    - supabaseKey: {{ anon key }}

5. Check Supabase Dashboard: http://127.0.0.1:54323

6. Create Tables
    Access the dashboard, go to SQL editor, enter the following SQL and execute:
    ```
    CREATE TABLE IF NOT EXISTS chat_rooms (
        room_id VARCHAR(255) PRIMARY KEY,
        room_pw VARCHAR(255),
        room_name VARCHAR(255),
        is_private BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS messages (
        message_id VARCHAR(255) PRIMARY KEY,
        room_id VARCHAR(255),
        user_id VARCHAR(255),
        user_name VARCHAR(255),
        content TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
    );
    ```

7. Enable Realtime for messages table
    After creating the tables, go to the Table editor in the dashboard, click on the messages table, and click the "Realtime off" button in the top right corner to change it to "on".

9. Stop Supabase
    ```
    supabase stop
    ```

# PBC 적용 방법

1. 프로젝트 루트 디렉토리의 SNSApp.vue 에 다음 코드를 등록합니다.
// 기존 v-main 태그에 v-else 및 상단에 <chat-chat-room-cards/> 추가
<template>
    <v-main v-if="openChatRoom"> 
        <chat-app>
            <chat-chat-room-cards/>
        </chat-app>
    </v-main>
    <v-main v-else>
        <!-- existing code .. -->
    </v-main>
</template>

// openChatRoom 데이터 추가
data : () => ({
    openChatRoom: false,
})

// 함수 추가

changeUrl() {
    var path = document.location.href.split("#/")
    this.urlPath = path[1];
    this.flipped.fill(false);
    this.openChatRoom = false; // 해당 라인 추가
},
startChat(){
    this.openChatRoom = true
}

2. supabase.js 의 supabaseUrl 을 다음과 같이 수정합니다.

supabaseUrl = 'localhost:54321' // gitpod 를 사용하는 경우 'https://54321-<username>.gitpod.io'

3. 54321 port -> make public // gitpod 를 사용하는 경우

## PBC 적용 방법
https://github.com/kyusooK/Cluster-distribute-rule/blob/main/README.md
