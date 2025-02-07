<template>
    <v-card outlined class="enter-chat-dialog">
        <v-card-title class="chat-dialog-header">
            <v-icon large color="primary" class="mr-3">mdi-account-circle</v-icon>
            채팅방 입장
            <v-spacer></v-spacer>
            <v-btn icon @click="close">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-card-title>

        <v-card-text class="pt-5">
            <v-form ref="form" v-model="isFormValid">
                <v-text-field
                    v-model="value.user_id"
                    label="아이디"
                    prepend-inner-icon="mdi-account"
                    :rules="[
                        v => !!v || '아이디를 입력해주세요',
                        v => /.+@.+\..+/.test(v) || '올바른 이메일 형식을 입력해주세요'
                    ]"
                    outlined
                    dense
                    class="mb-3"
                ></v-text-field>

                <v-text-field
                    v-model="value.user_name"
                    label="닉네임"
                    prepend-inner-icon="mdi-card-account-details"
                    :rules="[v => !!v || '닉네임을 입력해주세요']"
                    outlined
                    dense
                    class="mb-3"
                ></v-text-field>

                <v-text-field
                    v-if="chatRoomInfo && chatRoomInfo.is_private"
                    v-model="value.room_pw"
                    label="방 비밀번호"
                    prepend-inner-icon="mdi-lock"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'"
                    @click:append="showPassword = !showPassword"
                    :rules="[v => !!v || '비밀번호를 입력해주세요']"
                    outlined
                    dense
                    class="mb-3"
                ></v-text-field>

                <v-checkbox
                    v-model="rememberMe"
                    label="로그인 정보 저장"
                    color="primary"
                    hide-details
                    class="mt-2"
                ></v-checkbox>
            </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
                text
                @click="close"
                class="mr-2"
            >
                취소
            </v-btn>
            <v-btn
                color="primary"
                :disabled="!isFormValid"
                @click="enterChatRoom"
                :loading="loading"
            >
                <v-icon left>mdi-login</v-icon>
                입장하기
            </v-btn>
        </v-card-actions>

        <v-snackbar
            v-model="snackbar.show"
            :color="snackbar.color"
            :timeout="snackbar.timeout"
            top
        >
            {{ snackbar.text }}
            <template v-slot:action="{ attrs }">
                <v-btn
                    text
                    v-bind="attrs"
                    @click="snackbar.show = false"
                >
                    닫기
                </v-btn>
            </template>
        </v-snackbar>
    </v-card>
</template>

<script>
export default {
    name: 'EnterChatRoomCommand',
    props: {
        chatRoomInfo: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        editMode: true,
        value: {
            user_id: '',
            user_name: '',
            room_pw: ''
        },
        isFormValid: false,
        showPassword: false,
        loading: false,
        rememberMe: false,
        snackbar: {
            show: false,
            text: '',
            color: 'error',
            timeout: 3000
        },
    }),
    async created() {
        const storedUserInfo = localStorage.getItem('chatUserInfo');
        if (storedUserInfo) {
            this.value = JSON.parse(storedUserInfo);
            this.rememberMe = true;
        }
    },
    methods: {
        async enterChatRoom() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;
            try {
                if (this.rememberMe) {
                    this.value.rememberMe = true;
                } else {
                    this.value.rememberMe = false;
                }
                localStorage.setItem('chatUserInfo', JSON.stringify(this.value));

                if (this.chatRoomInfo.is_private && this.value.room_pw !== this.chatRoomInfo.room_pw) {
                    this.value.room_pw = '';
                    return;
                }

                await this.$emit('enterChatRoom',);
            } catch (error) {
                this.snackbar.text = '입장에 실패했습니다. 다시 시도해주세요.';
                this.snackbar.show = true;
            } finally {
                this.loading = false;
            }
        },
        close() {
            if (!this.rememberMe) {
                this.value = {
                    user_id: '',
                    user_name: '',
                    room_pw: ''
                };
            }
            this.$emit('closeDialog');
        },
        change() {
            this.$emit('input', this.value);
        }
    }
}
</script>

<style scoped>
.enter-chat-dialog {
    border-radius: 8px;
}

.chat-dialog-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.v-text-field {
    transition: all 0.3s;
}

.v-text-field:hover {
    transform: translateX(4px);
}

.v-btn {
    text-transform: none;
}
</style>