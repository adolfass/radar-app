import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function useBusinessCards() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/business-cards`);
      setCards(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load business cards');
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (data: any) => {
    const response = await axios.post(`${API_URL}/business-cards`, data);
    await fetchCards();
    return response.data;
  };

  const updateCard = async (id: number, data: any) => {
    const response = await axios.put(`${API_URL}/business-cards/${id}`, data);
    await fetchCards();
    return response.data;
  };

  const deleteCard = async (id: number) => {
    await axios.delete(`${API_URL}/business-cards/${id}`);
    await fetchCards();
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return { cards, loading, error, refetch: fetchCards, createCard, updateCard, deleteCard };
}

export function useContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async (search?: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/contacts`, {
        params: { search },
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addByRef = async (contactId: string, refUserId?: string) => {
    return axios.post(`${API_URL}/contacts/add-by-ref`, { contactId, refUserId });
  };

  const deleteContact = async (id: number) => {
    await axios.delete(`${API_URL}/contacts/${id}`);
    await fetchContacts();
  };

  const exportVCard = async (id: number) => {
    return axios.get(`${API_URL}/contacts/export/${id}`);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return { contacts, loading, refetch: fetchContacts, addByRef, deleteContact, exportVCard };
}

export function useEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: number) => {
    return axios.post(`${API_URL}/events/${eventId}/register`);
  };

  const unregisterFromEvent = async (eventId: number) => {
    return axios.post(`${API_URL}/events/${eventId}/unregister`);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, refetch: fetchEvents, registerForEvent, unregisterFromEvent };
}

export function useReferrals() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/referrals/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = async () => {
    return axios.get(`${API_URL}/referrals/link`);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats, getReferralLink };
}
