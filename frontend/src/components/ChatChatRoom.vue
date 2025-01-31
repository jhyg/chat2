<template>
    <v-card class="chat-room-card" outlined>
        <v-card-title class="chat-room-header">
            <v-avatar
                color="primary"
                size="40"
                class="mr-3"
            >
                <span class="white--text">{{ value.roomName ? value.roomName[0].toUpperCase() : 'C' }}</span>
            </v-avatar>
            
            <div class="chat-room-title">
                <div class="title" v-if="value._links">
                    {{ value.roomName }}
                    <v-chip
                        x-small
                        class="ml-2"
                        color="primary"
                        label
                    >
                        #{{ decode(value._links.self.href.split("/")[value._links.self.href.split("/").length - 1]) }}
                    </v-chip>
                </div>
                <div class="subtitle-2 grey--text">
                    {{ value.roomId }}
                </div>
            </div>

            <v-spacer></v-spacer>

            <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item @click="edit" v-if="!editMode">
                        <v-list-item-icon>
                            <v-icon>mdi-pencil</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>수정</v-list-item-title>
                    </v-list-item>
                    
                    <v-list-item @click="remove" v-if="!editMode">
                        <v-list-item-icon>
                            <v-icon>mdi-delete</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>삭제</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="chat-room-content">
            <v-form v-if="editMode" ref="form">
                <v-text-field
                    v-if="editMode"
                    v-model="value.roomId"
                    label="Room ID"
                    outlined
                    dense
                    :disabled="!isNew"
                ></v-text-field>
                
                <v-text-field
                    v-model="value.roomPw"
                    label="Room Password"
                    :type="showPassword ? 'text' : 'password'"
                    outlined
                    dense
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showPassword = !showPassword"
                ></v-text-field>
                
                <v-text-field
                    v-model="value.roomName"
                    label="Room Name"
                    outlined
                    dense
                ></v-text-field>
            </v-form>
            
            <v-list v-else two-line>
                <v-list-item>
                    <v-list-item-icon>
                        <v-icon>mdi-shield-lock</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>비밀번호</v-list-item-title>
                        <v-list-item-subtitle>{{ value.roomPw ? '설정됨' : '설정되지 않음' }}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="chat-room-actions">
            <template v-if="editMode">
                <v-btn
                    color="primary"
                    text
                    @click="save"
                >
                    <v-icon left>mdi-content-save</v-icon>
                    저장
                </v-btn>
                <v-btn
                    text
                    @click="editMode = false"
                    v-if="!isNew"
                >
                    취소
                </v-btn>
            </template>
            <template v-else>
                <v-btn
                    color="primary"
                    outlined
                    @click="openEnterChatRoom"
                    class="flex-grow-1"
                >
                    <v-icon left>mdi-login</v-icon>
                    입장하기
                </v-btn>
            </template>
        </v-card-actions>

        <!-- Enter Chat Room Dialog -->
        <v-dialog v-model="enterChatRoomDiagram" max-width="500px">
            <EnterChatRoomCommand
                @closeDialog="closeEnterChatRoom"
                @enterChatRoom="enterChatRoom"
            ></EnterChatRoomCommand>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar
            v-model="snackbar.status"
            :timeout="snackbar.timeout"
            :color="snackbar.color"
            top
        >
            {{ snackbar.text }}
            <template v-slot:action="{ attrs }">
                <v-btn
                    text
                    v-bind="attrs"
                    @click="snackbar.status = false"
                >
                    닫기
                </v-btn>
            </template>
        </v-snackbar>
    </v-card>
</template>

<script>
    const axios = require('axios').default;


    export default {
        name: 'ChatChatRoom',
        components:{
        },
        props: {
            value: [Object, String, Number, Boolean, Array],
            editMode: Boolean,
            isNew: Boolean,
            offline: Boolean,
        },
        data: () => ({
            snackbar: {
                status: false,
                timeout: 5000,
                text: '',
                color: 'error'
            },
            enterChatRoomDiagram: false,
            showPassword: false,
        }),
	async created() {
        },
        methods: {
            decode(value) {
                return decodeURIComponent(value);
            },
            selectFile(){
                if(this.editMode == false) {
                    return false;
                }
                var me = this
                var input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.id = "uploadInput";
                
                input.click();
                input.onchange = function (event) {
                    var file = event.target.files[0]
                    var reader = new FileReader();

                    reader.onload = function () {
                        var result = reader.result;
                        me.imageUrl = result;
                        me.value.photo = result;
                        
                    };
                    reader.readAsDataURL( file );
                };
            },
            edit() {
                this.editMode = true;
            },
            async save(){
                try {
                    var temp = null;

                    if(!this.offline) {
                        if(this.isNew) {
                            temp = await axios.post(axios.fixUrl('/chatRooms'), this.value)
                        } else {
                            temp = await axios.put(axios.fixUrl(this.value._links.self.href), this.value)
                        }
                    }

                    if(this.value!=null) {
                        for(var k in temp.data) this.value[k]=temp.data[k];
                    } else {
                        this.value = temp.data;
                    }

                    this.editMode = false;
                    this.$emit('input', this.value);

                    if (this.isNew) {
                        this.$emit('add', this.value);
                    } else {
                        this.$emit('edit', this.value);
                    }

                    location.reload()

                } catch(e) {
                    this.snackbar.status = true
                    if(e.response && e.response.data.message) {
                        this.snackbar.text = e.response.data.message
                    } else {
                        this.snackbar.text = e
                    }
                }
                
            },
            async remove(){
                try {
                    if (!this.offline) {
                        await axios.delete(axios.fixUrl(this.value._links.self.href))
                    }

                    this.editMode = false;
                    this.isDeleted = true;

                    this.$emit('input', this.value);
                    this.$emit('delete', this.value);

                } catch(e) {
                    this.snackbar.status = true
                    if(e.response && e.response.data.message) {
                        this.snackbar.text = e.response.data.message
                    } else {
                        this.snackbar.text = e
                    }
                }
            },
            change(){
                this.$emit('input', this.value);
            },
            async createChatRoom() {
                try {
                    if(!this.offline) {
                        var temp = await axios.put(axios.fixUrl(this.value._links['createchatroom'].href))
                        for(var k in temp.data) {
                            this.value[k]=temp.data[k];
                        }
                    }

                    this.editMode = false;
                } catch(e) {
                    this.snackbar.status = true
                    if(e.response && e.response.data.message) {
                        this.snackbar.text = e.response.data.message
                    } else {
                        this.snackbar.text = e
                    }
                }
            },
            async enterChatRoom(params) {
                try {
                    if(!this.offline) {
                        var temp = await axios.put(axios.fixUrl(this.value._links['enterchatroom'].href), params)
                        for(var k in temp.data) {
                            this.value[k]=temp.data[k];
                        }
                        
                        // 사용자 정보 로컬스토리지에 저장
                        localStorage.setItem('chatUserInfo', JSON.stringify({
                            userId: params.userId,
                            userName: params.userName,
                            userPassWord: params.userPassWord
                        }));
                        
                        // 채팅방으로 라우터 이동
                        this.$router.push(`/chats/chatRooms/${this.value.roomId}`);
                    }

                    this.editMode = false;
                    this.closeEnterChatRoom();
                } catch(e) {
                    this.snackbar.status = true
                    if(e.response && e.response.data.message) {
                        this.snackbar.text = e.response.data.message
                    } else {
                        this.snackbar.text = e
                    }
                }
            },
            openEnterChatRoom() {
                this.enterChatRoomDiagram = true;
            },
            closeEnterChatRoom() {
                this.enterChatRoomDiagram = false;
            },
        },
    }
</script>

<style scoped>
.chat-room-card {
    width: 450px;
    height: 100%;
    transition: all 0.3s;
}

.chat-room-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}

.chat-room-header {
    background-color: #f8f9fa;
}

.chat-room-title {
    overflow: hidden;
}

.chat-room-content {
    padding: 20px;
}

.chat-room-actions {
    padding: 16px;
}

.v-btn {
    text-transform: none;
}
</style>