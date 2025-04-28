import React from "react";

const MovieInfo = ({ movie }) => {
  return (
    <div className="max-w-max bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl text-center">
        {movie.name} (T{movie.ageLimit})
      </h1>
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={movie.posterUrl}
          alt={movie.name}
          className="w-3xs h-full object-cover"
        />
      </div>
    </div>
  );
};

export default MovieInfo;
