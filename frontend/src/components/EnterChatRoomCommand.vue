<template>
    <v-card outlined style="border-radius: 8px;">
        <v-card-title style="background-color: #f8f9fa; border-bottom: 1px solid #e9ecef;">
            <v-icon large color="primary" style="margin-right: 12px;">mdi-account-circle</v-icon>
            채팅방 입장
            <v-spacer></v-spacer>
            <v-btn icon @click="close">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-card-title>

        <v-card-text style="padding-top: 20px;">
            <v-form ref="form" v-model="isFormValid">
                <v-text-field
                    v-if="chatRoomInfo && chatRoomInfo.is_private"
                    v-model="room_pw"
                    label="방 비밀번호"
                    prepend-inner-icon="mdi-lock"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPassword ? 'text' : 'password'"
                    @click:append="showPassword = !showPassword"
                    :rules="[v => !!v || '비밀번호를 입력해주세요']"
                    outlined
                    dense
                    style="margin-bottom: 12px; transition: all 0.3s;"
                    @mouseover="$event.target.style.transform = 'translateX(4px)'"
                    @mouseleave="$event.target.style.transform = 'translateX(0)'"
                ></v-text-field>
            </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions style="padding: 16px;">
            <v-spacer></v-spacer>
            <v-btn
                text
                @click="close"
                style="margin-right: 8px; text-transform: none;"
            >
                취소
            </v-btn>
            <v-btn
                color="primary"
                :disabled="!isFormValid"
                @click="enterChatRoom"
                :loading="loading"
                style="text-transform: none;"
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
                    style="text-transform: none;"
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
        room_pw: '',
        isFormValid: false,
        showPassword: false,
        loading: false,
        snackbar: {
            show: false,
            text: '',
            color: 'error',
            timeout: 3000
        },
    }),
    async created() {},
    methods: {
        async enterChatRoom() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;
            try {
                if (this.chatRoomInfo.is_private && this.room_pw !== this.chatRoomInfo.room_pw) {
                    this.room_pw = '';
                    return;
                }

                await this.$emit('enterChatRoom');
            } catch (error) {
                this.snackbar.text = '입장에 실패했습니다. 다시 시도해주세요.';
                this.snackbar.show = true;
            } finally {
                this.loading = false;
            }
        },
        close() {
            this.room_pw = '';
            this.$emit('closeDialog');
        },
    }
}
</script>