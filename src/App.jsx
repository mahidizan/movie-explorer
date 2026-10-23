import { useEffect, useState } from "react";
import { isCancel } from "axios";
import { getPopularMovies, searchMovies } from "./api/tmdb";
import MovieCard from "./components/MovieCard";
import "./App.css";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedMovie, setSelectedMovie] = useState(null);

  // gets the movies
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    const request = search
      ? searchMovies(search, page, controller.signal)
      : getPopularMovies(page, controller.signal);

    request
      .then((data) => {
        if (page === 1) {
          setMovies(data.results);
        } else {
          setMovies((currentMovies) => [...currentMovies, ...data.results]);
        }

        setTotalPages(data.total_pages);
        setLoading(false);
      })
      .catch((err) => {
        if (isCancel(err)) return;

        setError("Couldn't load movies. Try again later.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [search, page]);

  // searches for a movie
  function handleSubmit(e) {
    e.preventDefault();

    setMovies([]);
    setSelectedMovie(null);
    setPage(1);
    setSearch(query.trim());
  }

  // loads more movies
  function loadMore() {
    setPage(page + 1);
  }

  return (
    <main className="app">
      <h1>Movie Explorer</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
        />

        <button type="submit">Search</button>
      </form>

      {selectedMovie && (
        <section className="details">
          <h2>{selectedMovie.title}</h2>

          <p>{selectedMovie.overview || "No overview available."}</p>

          <button onClick={() => setSelectedMovie(null)}>Close</button>
        </section>
      )}

      {loading && movies.length === 0 && <p>Loading...</p>}

      {error && <p className="error">{error}</p>}

      {!loading && !error && search && movies.length === 0 && (
        <p>No results for "{search}"</p>
      )}

      {movies.length > 0 && (
        <div className="grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={setSelectedMovie}
            />
          ))}
        </div>
      )}

      {loading && movies.length > 0 && <p>Loading...</p>}

      {!loading && !error && movies.length > 0 && page < totalPages && (
        <button className="load-more" onClick={loadMore}>
          Load More
        </button>
      )}
    </main>
  );
}
