import React from 'react';

const Hero = () => {
  return (
    <section className="relative bg-cover bg-center h-auto md:p-12 py-12" style={{ 
        backgroundImage: "url('https://preview.redd.it/aihj4mgqfzq11.png?width=1080&crop=smart&auto=webp&s=a39bd0251226d936a94ece72ce0519b02364e7ef')",
        backgroundSize: 'contain',
         }}>
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="relative container mx-auto px-6 lg:px-12 flex items-center justify-center h-full">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover Your Next Favorite Manga</h1>
          <p className="text-lg md:text-2xl mb-8">Explore a vast collection of manga from various genres and authors.</p>
          <div className='flex justify-center items-center gap-4'>
            <button >
            <a href="#manga-collection" className="inline-block text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 px-6 rounded-lg transition duration-300 ease-in-out">Start Reading</a>
            </button>
            <button>
                <a href="" className="inline-block text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-2 md:py-3 px-6 rounded-lg transition duration-300 ease-in-out">Signin to upload</a>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
