
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);


import ChatChatRoomManager from "./components/listers/ChatChatRoomCards"
import ChatChatRoomDetail from "./components/listers/ChatChatRoomDetail"
import ChatMessageManager from "./components/listers/ChatMessageCards"
import ChatMessageDetail from "./components/listers/ChatMessageDetail"


export default new Router({
    // mode: 'history',
    base: process.env.BASE_URL,
    routes: [
            {
                path: '/chats/chatRooms',
                name: 'ChatChatRoomManager',
                component: ChatChatRoomManager
            },
            {
                path: '/chats/chatRooms/:id',
                name: 'ChatChatRoomDetail',
                component: ChatChatRoomDetail
            },
            {
                path: '/chats/messages',
                name: 'ChatMessageManager',
                component: ChatMessageManager
            },
            {
                path: '/chats/messages/:id',
                name: 'ChatMessageDetail',
                component: ChatMessageDetail
            },
            
    ]
})
