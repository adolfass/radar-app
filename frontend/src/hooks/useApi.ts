import { useState, useEffect } from 'react';
import { api } from '../lib/api';

type BusinessCard = Record<string, unknown>;
type Contact = Record<string, unknown>;
type Event = Record<string, unknown>;
type ReferralStats = Record<string, unknown>;

export function useBusinessCards() {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/business-cards');
      setCards(response.data);
      setError(null);
    } catch (err) {
      const error = err as ApiError;
      setError(error.response?.data?.message || 'Failed to load business cards');
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (data: Partial<BusinessCard>) => {
    const response = await api.post('/business-cards', data);
    await fetchCards();
    return response.data;
  };

  const updateCard = async (id: number, data: Partial<BusinessCard>) => {
    const response = await api.put(`/business-cards/${id}`, data);
    await fetchCards();
    return response.data;
  };

  const deleteCard = async (id: number) => {
    await api.delete(`/business-cards/${id}`);
    await fetchCards();
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return { cards, loading, error, refetch: fetchCards, createCard, updateCard, deleteCard };
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async (search?: string) => {
    try {
      setLoading(true);
      const response = await api.get('/contacts', {
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
    return api.post('/contacts/add-by-ref', { contactId, refUserId });
  };

  const deleteContact = async (id: number) => {
    await api.delete(`/contacts/${id}`);
    await fetchContacts();
  };

  const exportVCard = async (id: number) => {
    return api.get(`/contacts/export/${id}`);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return { contacts, loading, refetch: fetchContacts, addByRef, deleteContact, exportVCard };
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: number) => {
    return api.post(`/events/${eventId}/register`);
  };

  const unregisterFromEvent = async (eventId: number) => {
    return api.post(`/events/${eventId}/unregister`);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, refetch: fetchEvents, registerForEvent, unregisterFromEvent };
}

export function useReferrals() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/referrals/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = async () => {
    return api.get('/referrals/link');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats, getReferralLink };
}
