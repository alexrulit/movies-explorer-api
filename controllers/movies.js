const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const NotCorrectDataError = require('../errors/not-correct-data-err');
const InternalServerError = require('../errors/internal-srv-err');

const createMovie = (req, res, next) => {
  const {
    movieId,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;

  Movie.create({
    movieId,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    owner,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      if (!movie) {
        throw new NotCorrectDataError('Переданы некорректные данные');
      }
      const newMovie = movie.toObject();
      delete newMovie.owner;
      res.send(newMovie);
    })
    .catch(next);
};

const findMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movieList) => {
      if (!movieList) {
        throw new InternalServerError('Не удалось получить список фильмов');
      }
      res.send(movieList);
    })
    .catch(next);
};

const deleteMovie = (req, res, next) => {
  if (!req.params.movieId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new NotCorrectDataError('Передан некорректный id фильма');
  }
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм с указанным id не найден');
      }
      if (toString(movie.owner) === toString(req.user._id)) {
        Movie.findByIdAndRemove(movie._id)
          .then((removeMovie) => {
            if (removeMovie !== null) {
              res.send(removeMovie);
            } else {
              throw new NotFoundError('Фильм с указанным id не найден');
            }
          })
          .catch(next);
      } else {
        throw new NotCorrectDataError('Вы можете удалять только собственные фильмы');
      }
    })
    .catch(next);
};

module.exports = {
  createMovie,
  findMovies,
  deleteMovie,
};
