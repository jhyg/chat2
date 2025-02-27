<template>
    <v-card outlined>
        <v-card-title style="border-bottom: 1px solid #e0e0e0; background-color: #f5f5f5;">
            <v-btn style="margin-right: 10px;" icon @click="goList"><v-icon>mdi-arrow-left</v-icon></v-btn>
            <v-icon left>mdi-chat</v-icon>
            <div>{{chatRoomInfo.room_name}} </div>
            <v-chip small class="ml-2">
                Room #{{chatRoomInfo.room_id}}
            </v-chip>
        </v-card-title>

        <!-- 채팅 메시지 영역 -->
        <v-card-text style="height: 76vh; overflow-y: auto; padding: 20px; background-color: #f8f9fa;">
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div v-for="(message, index) in messages" 
                     :key="index"
                     :style="{
                         display: 'flex',
                         flexDirection: 'column', 
                         maxWidth: '70%',
                         marginBottom: '12px',
                         alignSelf: message.user_id === userInfo.user_id ? 'flex-end' : 'flex-start'
                     }">
                    
                    <!-- 상대방 메시지 -->
                    <template v-if="message.user_id !== userInfo.user_id">
                        <div style="font-size: 0.8rem; color: #666; margin-bottom: 4px; margin-left: 8px;">{{ message.user_name }} ({{ message.user_id }})</div>
                            <div style="display: flex; align-items: flex-end; gap: 6px; justify-content: flex-start;">
                                <div style="padding: 8px 16px; border-radius: 16px; position: relative; word-wrap: break-word; background-color: white; color: #333; border-top-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); width: fit-content;">
                                    {{ message.content }}
                                </div>
                            <div style="font-size: 0.75rem; color: #999; min-width: fit-content;">{{ formatTime(message.timestamp) }}</div>
                        </div>
                    </template>

                    <!-- 내 메시지 -->
                    <template v-else>
                        <div style="display: flex; align-items: flex-end; gap: 6px; justify-content: flex-end;">
                            <div style="font-size: 0.75rem; color: #999; min-width: fit-content;">{{ formatTime(message.timestamp) }}</div>
                            <div style="padding: 8px 16px; border-radius: 16px; position: relative; word-wrap: break-word; background-color: #e3f2fd; color: #1976d2; border-top-right-radius: 4px;">
                                {{ message.content }}
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </v-card-text>

        <!-- 채팅 입력 영역 -->
        <v-card-actions style="padding: 16px; border-top: 1px solid #e0e0e0; background-color: white;">
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
    import { supabase } from '../../supabase';

    export default {
        name: 'ChatChatRoomDetail',
        components:{},
        props: {
            roomId: {
                type: String,
                required: true
            }
        },
        data: () => ({
            chatRoomInfo: {},
            editMode: false,
            messages: [],
            userInfo: null,
            newMessage: '',
        }),
        async created() {
            const storedUserInfo = localStorage.getItem('userInfo');
            if (storedUserInfo) {
                // keyclock 구조에 맞게 수정
                this.userInfo = JSON.parse(storedUserInfo);
            } else {
                this.$emit('unauthorized');
                return;
            }
            await this.loadChatRoomInfo();
            await this.loadMessages();
            this.setupRealtimeMessages();
        },
        methods: {
            async loadChatRoomInfo() {
                try {
                    const { data, error } = await supabase
                    .from('chat_rooms')
                    .select('*')
                    .eq('room_id', this.roomId)
                    .single();

                    if (error) throw error;

                    this.chatRoomInfo = data;
                } catch (e) {
                    console.error('Error loading chat room info:', e);
                }
            },
            async loadMessages() {
                try {
                    const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('room_id', this.roomId)
                    .order('timestamp', { ascending: true });

                    if (error) throw error;

                    this.messages = data;
                } catch (e) {
                    console.error('Error loading messages:', e);
                }
            },
            setupRealtimeMessages() {
                supabase
                .channel('public:messages')
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages', 
                    filter: `room_id=eq.${this.roomId}`
                }, payload => {
                    this.messages.push(payload.new);
                })
                .subscribe();
            },
            async sendMessage() {
                if (!this.newMessage.trim()) return;

                try {
                    const messageData = {
                        message_id: this.generateUUID(),
                        room_id: this.chatRoomInfo.room_id,
                        user_id: this.userInfo.user_id,
                        user_name: this.userInfo.user_name,
                        content: this.newMessage,
                        timestamp: new Date(new Date().getTime() + (9 * 60 * 60 * 1000)).toISOString()
                    };

                    const { error } = await supabase
                    .from('messages')
                    .insert([messageData]);

                    if (error) throw error;

                    this.newMessage = '';
                } catch (e) {
                    console.error('메시지 전송 실패:', e);
                }
            },
            generateUUID() {
                return 'm' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0,
                        v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            },
            goList() {
                this.$emit('exit');
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
            formatTime(timestamp) {
                if (!timestamp) return '';
                const date = new Date(timestamp);
                return date.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            },
        },
    };
</script>

