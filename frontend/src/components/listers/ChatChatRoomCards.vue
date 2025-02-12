<template>
    <div v-if="selectedRoomId">
        <ChatChatRoomDetail
            :roomId="selectedRoomId"
            @unauthorized="handleUnauthorized"
            @exit="handleExit"
        />
    </div>
    <div v-else>
        <v-card
            class="mx-auto"
            outlined
            color="primary"
            style="padding:10px 0px 10px 0px; margin-bottom:40px;"
        >
            <v-row>
                <v-list-item class="d-flex" style="background-color: white;">
                    <h1 class="align-self-center ml-3">ChatRoom</h1>
                    <div class="secondary-text-color" style="margin-left:30px;"></div>
                </v-list-item>
            </v-row>
        </v-card>
        <v-col style="margin-bottom:40px;">
            <div class="text-center">
                <v-dialog
                        v-model="openDialog"
                        width="332.5"
                        fullscreen
                        hide-overlay
                        transition="dialog-bottom-transition"
                >
                    <ChatChatRoom :offline="offline" class="video-card" :isNew="true" :editMode="true" :createMode="true" v-model="newValue" 
                            @add="append" v-if="tick" @enterRoom="handleEnterRoom"/>

                    <v-btn
                            style="postition:absolute; top:2%; right:2%"
                            @click="closeDialog()"
                            depressed
                            icon 
                            absolute
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-dialog>

                <v-row>
                    <v-card
                        class="mx-auto"
                        style="height:300px; width:300px; margin-bottom:20px; text-align: center;"
                        outlined
                    >
                        <v-list-item>
                            <v-list-item-avatar 
                                class="mx-auto"
                                size="80"
                                style="margin-top:80px;"
                            ><v-icon color="primary" x-large>mdi-plus</v-icon>
                            </v-list-item-avatar>
                        </v-list-item>

                        <v-card-actions>
                            <v-btn 
                                v-on="on"
                                class="mx-auto"
                                outlined
                                rounded
                                @click="openDialog=true;"
                                color="primary"
                                style="font-weight:500; font-size:20px; padding:15px; border:solid 2px; max-width:250px; overflow:hidden"
                            >
                                ChatRoom 등록
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-row>
            </div>
        </v-col>
        <v-row>
            <ChatChatRoom :offline="offline" class="video-card" v-for="(value, index) in values" v-model="values[index]" v-bind:key="index" @delete="remove" @enterRoom="handleEnterRoom"/>
        </v-row>
    </div>
</template>

<script>

    // const axios = require('axios').default;
    import ChatChatRoom from './../ChatChatRoom.vue';
    import ChatChatRoomDetail from './ChatChatRoomDetail.vue';

    export default {
        name: 'ChatChatRoomCards',
        components: {
            ChatChatRoom,
            ChatChatRoomDetail,
        },
        props: {
            offline: Boolean
        },
        data: () => ({
            values: [],
            newValue: {},
            tick : true,
            openDialog : false,
            selectedRoomId: null,
        }),
        async created() {
            var me = this;
            if(me.offline){
                if(!me.values) me.values = [];
                return;
            } 
            
            await this.loadChatRooms();
            
            me.newValue = {
                'room_id': '',
                'room_pw': '',
                'room_name': '',
                'is_private': false
            }
        },
        methods:{
            async loadChatRooms(){
                try {
                    const { data, error } = await this.$supabase
                    .from('chatrooms')
                    .select('*');

                    if (error) {
                        throw error;
                    }

                    this.values = data || [];
                } catch (e) {
                    console.error('Error loading chat rooms:', e);
                }
            },
            closeDialog(){
                this.openDialog = false
            },
            append(value){
                this.tick = false
                this.newValue = {}
                this.values.push(value)
                
                this.$emit('input', this.values);

                this.$nextTick(function(){
                    this.tick=true
                })
            },
            remove(value){
                var where = -1;
                for(var i=0; i<this.values.length; i++){
                    if(this.values[i]._links.self.href == value._links.self.href){
                        where = i;
                        break;
                    }
                }

                if(where > -1){
                    this.values.splice(i, 1);
                    this.$emit('input', this.values);
                }
            },
            handleEnterRoom(roomId) {
                this.selectedRoomId = roomId;
                // 채팅방 상세 화면 표시 로직
            },
            handleUnauthorized() {
                // 인증되지 않은 사용자 처리 로직
                alert('로그인 후 이용 가능한 서비스입니다.');
                this.handleExit();
            },
            handleExit() {
                this.selectedRoomId = null;
                // 채팅방 목록으로 돌아가는 로직
            }
        }
    };
</script>


<style>
    .video-card {
        width:300px; 
        margin-left:4.5%; 
        margin-top:50px; 
        margin-bottom:50px;
    }
</style>

