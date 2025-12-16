'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Define um tipo para os dados do perfil do usuário para maior segurança de tipo
interface UserProfile {
  display_name: string;
  email: string;
  images: { url: string }[];
}

export default function Dashboard() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('access_token');
    if (token) {
      setAccessToken(token);
      // Armazena o token no localStorage para persistência entre sessões
      localStorage.setItem('spotify_access_token', token);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchUserProfile = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar dados do usuário');
        }

        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Ocorreu um erro desconhecido');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [accessToken]);

  const renderContent = () => {
    if (loading && !error) {
      return <p className="text-yellow-400 mt-4">Carregando dados do perfil...</p>;
    }

    if (error) {
      return <p className="text-red-500 mt-4">Erro: {error}</p>;
    }

    if (userProfile) {
      return (
        <div className="text-center mt-8">
          {userProfile.images?.[0]?.url && (
            <img 
              src={userProfile.images[0].url} 
              alt={`Foto de perfil de ${userProfile.display_name}`}
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-green-500"
            />
          )}
          <h2 className="text-3xl font-semibold">Bem-vindo, {userProfile.display_name}!</h2>
          <p className="text-gray-400">{userProfile.email}</p>
        </div>
      );
    }

    return <p className="text-yellow-400 mt-4">Aguardando token de acesso...</p>;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-5xl font-bold mb-4">Seu Dashboard Musical</h1>
      {renderContent()}
    </div>
  );
}
