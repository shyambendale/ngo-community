import axios from 'axios';
import { API_BASE_URL } from '../config';

const messagesAPI = {
  // Send a message
  sendMessage: async (messageData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages`,
        messageData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        error: 'Failed to send message'
      };
    }
  },

  // Get all conversations for the logged-in user
  getConversations: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/conversations`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        error: 'Failed to fetch conversations'
      };
    }
  },

  // Get messages between the logged-in user and another user
  getMessages: async (user, withUser) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/${encodeURIComponent(withUser)}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        error: 'Failed to fetch messages'
      };
    }
  }
};

export default messagesAPI;