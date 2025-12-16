export default function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">Analisador de Músicas</h1>
        <p className="text-xl text-gray-400 mb-8">
          Descubra insights sobre seus hábitos musicais no Spotify.
        </p>
        <a
          href={`${backendUrl}/login`}
          className="inline-block bg-green-500 text-white font-bold py-4 px-8 rounded-full hover:bg-green-600 transition-transform duration-300 transform hover:scale-105"
        >
          Login com Spotify
        </a>
      </div>
    </main>
  );
}
