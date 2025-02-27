<template>
    <v-card style="width: 450px; height: 100%; margin-left:4.5%; margin-top:50px; margin-bottom:50px; transition: all 0.3s;" outlined>
        <v-card-title style="background-color: #f8f9fa;">
            <v-avatar
                color="primary"
                size="40"
                style="margin-right: 12px;"
            >
                <span style="color: white;">{{ value.room_name ? value.room_name[0].toUpperCase() : 'C' }}</span>
            </v-avatar>
            
            <div style="overflow: hidden;">
                <div v-if="value">
                    {{ value.room_name }}
                    <v-chip
                        x-small
                        style="margin-left: 8px;"
                        color="primary"
                        label
                    >
                        #{{ value.room_id }}
                    </v-chip>
                </div>
            </div>

            <v-spacer></v-spacer>

            <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-if="!editMode"
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

        <v-card-text style="padding: 20px;">
            <v-form v-if="editMode" ref="form" v-model="isFormValid">
                <v-text-field
                    style="margin-top: 10px;"
                    v-if="editMode"
                    v-model="value.room_id"
                    label="Room ID"
                    outlined
                    dense
                    :disabled="!isNew"
                    :rules="[v => !!v || 'Room ID를 입력해주세요']"
                ></v-text-field>

                <v-text-field
                    v-model="value.room_name"
                    label="Room Name"
                    outlined
                    dense
                    :rules="[v => !!v || 'Room Name을 입력해주세요']"
                ></v-text-field>
                
                <v-switch
                    v-model="isPrivate"
                    label="Private Room"
                    inset
                ></v-switch>
                
                <v-text-field
                    v-if="isPrivate"
                    v-model="value.room_pw"
                    label="Room Password"
                    :type="showPassword ? 'text' : 'password'"
                    outlined
                    dense
                    :rules="[v => !!v || 'Room Password를 입력해주세요']"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showPassword = !showPassword"
                ></v-text-field>
            </v-form>
            
            <v-list v-else two-line>
                <v-list-item>
                    <v-list-item-icon>
                        <v-icon>{{ value.is_private ? 'mdi-shield-lock' : 'mdi-shield-lock-open' }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>비밀번호</v-list-item-title>
                        <v-list-item-subtitle>{{ value.is_private ? '설정됨' : '설정되지 않음' }}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions style="padding: 16px;">
            <template v-if="editMode">
                <v-btn
                    color="primary"
                    text
                    :disabled="!isFormValid"
                    @click="save"
                    style="text-transform: none;"
                >
                    <v-icon left>mdi-content-save</v-icon>
                    저장
                </v-btn>
                <v-btn
                    text
                    @click="editMode = false"
                    v-if="!isNew"
                    style="text-transform: none;"
                >
                    취소
                </v-btn>
            </template>
            <template v-else>
                <v-btn
                    color="primary"
                    outlined
                    @click="openEnterChatRoom"
                    style="flex-grow: 1; text-transform: none;"
                >
                    <v-icon left>mdi-login</v-icon>
                    입장하기
                </v-btn>
            </template>
        </v-card-actions>

        <!-- Enter Chat Room Dialog -->
        <v-dialog v-model="enterChatRoomDiagram" max-width="500px">
            <EnterChatRoomCommand
                :chatRoomInfo="value"
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
                    style="text-transform: none;"
                >
                    닫기
                </v-btn>
            </template>
        </v-snackbar>
    </v-card>
</template>

<script>
    const axios = require('axios').default;

    import { supabase } from '../supabase';


    export default {
        name: 'ChatChatRoom',
        components:{
        },
        props: {
            value: [Object, String, Number, Boolean, Array],
            editMode: Boolean,
            isNew: Boolean,
            offline: Boolean,
            createMode: Boolean,
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
            isPrivate: false,
            isFormValid: false,
        }),
        async created() {},
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
            async save() {
                try {
                    if (this.createMode) {
                        // 생성 모드
                        const { error } = await supabase
                            .from('chat_rooms')
                            .insert([{
                                room_id: this.value.room_id,
                                room_pw: this.value.room_pw,
                                room_name: this.value.room_name,
                                is_private: this.isPrivate
                            }]);

                        if (error) throw error;

                        this.$emit('add', this.value);
                    } else {
                        // 수정 모드
                        const { error } = await supabase
                            .from('chat_rooms')
                            .update({
                                room_pw: this.value.room_pw,
                                room_name: this.value.room_name,
                                is_private: this.isPrivate
                            })
                            .eq('room_id', this.value.room_id); // room_id를 기준으로 수정

                        if (error) throw error;

                        this.$emit('edit', this.value);
                    }

                    this.editMode = false;
                    location.reload(); // 페이지 새로고침

                } catch (e) {
                    this.snackbar.status = true;
                    if (e.response && e.response.data.message) {
                        this.snackbar.text = e.response.data.message;
                    } else {
                        this.snackbar.text = e.message || e; // 오류 메시지 출력
                    }
                }
            },
            async remove() {
                try {
                    if (!this.offline) {
                        const { error } = await supabase
                            .from('chat_rooms')
                            .delete()
                            .eq('room_id', this.value.room_id);

                        if (error) throw error;
                    }

                    this.editMode = false;
                    this.isDeleted = true;

                    this.$emit('input', this.value);
                    this.$emit('delete', this.value);

                } catch (e) {
                    this.snackbar.status = true;
                    if (e.response && e.response.data.message) {
                        this.snackbar.text = e.response.data.message;
                    } else {
                        this.snackbar.text = e.message || e;
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
            async enterChatRoom() {
                try {
                    this.$emit('enterRoom', this.value.room_id);
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
                if(this.value.is_private){
                    this.enterChatRoomDiagram = true;
                } else {
                    this.enterChatRoom()
                }
            },
            closeEnterChatRoom() {
                this.enterChatRoomDiagram = false;
            },
        },
    }
</script>
