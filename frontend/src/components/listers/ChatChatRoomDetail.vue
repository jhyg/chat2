<template>
    <v-card outlined>
        <v-card-title class="chat-header">
            <v-icon left>mdi-chat</v-icon>
            {{chatRoomInfo.roomName}} 
            <v-chip small class="ml-2">
                Room #{{chatRoomInfo._links.self.href.split("/")[chatRoomInfo._links.self.href.split("/").length - 1]}}
            </v-chip>
        </v-card-title>

        <!-- 채팅 메시지 영역 -->
        <v-card-text class="chat-container">
            <div class="messages-wrapper">
                <div v-for="message in messages" 
                     :key="message._links.self.href"
                     :class="['message-item', message.userId === userInfo.userId ? 'my-message' : 'other-message']">
                    
                    <!-- 상대방 메시지 -->
                    <template v-if="message.userId !== userInfo.userId">
                        <div class="user-name">{{ message.userId }}</div>
                        <div class="message-bubble other">
                            {{ message.content }}
                        </div>
                    </template>

                    <!-- 내 메시지 -->
                    <template v-else>
                        <div class="message-bubble mine">
                            {{ message.content }}
                        </div>
                    </template>
                </div>
            </div>
        </v-card-text>

        <!-- 채팅 입력 영역 -->
        <v-card-actions class="chat-input">
            <v-text-field
                v-model="newMessage"
                placeholder="메시지를 입력하세요..."
                outlined
                dense
                hide-details
                @keypress.enter="sendMessage"
            >
                <template v-slot:append>
                    <v-btn
                        color="primary"
                        icon
                        @click="sendMessage"
                    >
                        <v-icon>mdi-send</v-icon>
                    </v-btn>
                </template>
            </v-text-field>
        </v-card-actions>
    </v-card>
</template>


<script>
    const axios = require('axios').default;

    export default {
        name: 'ChatChatRoomDetail',
        components:{},
        props: {
        },
        data: () => ({
            chatRoomInfo: null,
            editMode: false,
            messages: [],
            userInfo: null,
            newMessage: '',
        }),
        async created() {
            var me = this;
            var params = this.$route.params;
            var temp = await axios.get(axios.fixUrl('/chatRooms/' + params.id))
            if(temp.data) {
                me.chatRoomInfo = temp.data
                me.chatRoomInfo.id = params.id
            }

            const messageResponse = await axios.get(axios.fixUrl('/messages'))
            this.messages = messageResponse.data._embedded.messages.filter(
                msg => msg.roomId === params.id
            );

            const storedUserInfo = localStorage.getItem('chatUserInfo');
            if (storedUserInfo) {
                this.userInfo = JSON.parse(storedUserInfo);
            }
        },
        methods: {
            generateUUID() {
                return 'm' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0,
                        v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            },
            async sendMessage() {
                if (!this.newMessage.trim()) return;
                
                try {
                    const messageData = {
                        messageId: this.generateUUID(),
                        roomId: this.chatRoomInfo.id,
                        userId: this.userInfo.userId,
                        content: this.newMessage
                    };

                    const response = await axios.post(axios.fixUrl('/messages'), messageData);
                    
                    if (response.status === 200 || response.status === 201) {
                        this.messages.push(response.data);
                        this.newMessage = ''; 
                        
                        this.$nextTick(() => {
                            const container = document.querySelector('.chat-container');
                            container.scrollTop = container.scrollHeight;
                        });
                    }

                    
                    this.newMessage = ''; 
                } catch (e) {
                    console.error('메시지 전송 실패:', e);
                }
            },
            goList() {
                var path = window.location.href.slice(window.location.href.indexOf("/#/"), window.location.href.lastIndexOf("/#"));
                path = path.replace("/#/", "/");
                this.$router.push(path);
            },
            edit() {
                this.editMode = true;
            },
            async remove(){
                try {
                    if (!this.offline) {
                        await axios.delete(axios.fixUrl(this.chatRoomInfo._links.self.href))
                    }

                    this.editMode = false;

                    this.$emit('input', this.chatRoomInfo);
                    this.$emit('delete', this.chatRoomInfo);

                } catch(e) {
                    console.log(e)
                }
            },
        },
    };
</script>

<style scoped>
.chat-header {
    border-bottom: 1px solid #e0e0e0;
    background-color: #f5f5f5;
}

.chat-container {
    height: 60vh;
    overflow-y: auto;
    padding: 20px;
    background-color: #f8f9fa;
}

.messages-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.message-item {
    display: flex;
    flex-direction: column;
    max-width: 70%;
}

.my-message {
    align-self: flex-end;
}

.other-message {
    align-self: flex-start;
}

.user-name {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 4px;
    margin-left: 8px;
}

.message-bubble {
    padding: 8px 16px;
    border-radius: 16px;
    position: relative;
    word-wrap: break-word;
}

.message-bubble.mine {
    background-color: #e3f2fd;
    color: #1976d2;
    border-top-right-radius: 4px;
}

.message-bubble.other {
    background-color: white;
    color: #333;
    border-top-left-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.chat-input {
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    background-color: white;
}
</style>
