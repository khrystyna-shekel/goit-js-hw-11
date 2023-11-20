import PixabayApi from './js/pixabay-api';
import { lightbox } from './js/lightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryWrapper: document.querySelector('.gallery'),
  scroll: document.querySelector('.scroll'),
};

const { searchForm, galleryWrapper, scroll } = refs;

let isShown = 0;
const pixabayApi = new PixabayApi();

searchForm.addEventListener('submit', onSearch);

const options = {
  rootMargin: '100px',
  root: null,
  threshold: 0.3,
};
const observer = new IntersectionObserver(onLoadMoreBtnIntersect, options);

async function onLoadMoreBtnIntersect(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      onLoadMoreData();
    }
  });
}

async function onSearch(e) {
  e.preventDefault();

  galleryWrapper.innerHTML = '';
  pixabayApi.query = e.currentTarget.elements.searchQuery.value.trim().toLowerCase();
  pixabayApi.resetPage();

  if (pixabayApi.query === '') {
    Notify.warning('Please, fill the field!');
    return;
  }

  isShown = 0;
  await fetchGallery();
}

async function onLoadMoreData() {
  pixabayApi.incrementPage();
  await fetchGallery();
}

async function fetchGallery() {
  const { hits, totalHits } = await pixabayApi.fetchGallery();
  isShown += hits.length;

  if (totalHits > 40) {
    observer.observe(scroll);
  }

  if (!hits.length) {
    Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
    loadMoreBtn.classList.add('is-hidden');
    return;
  }

  onGetGallery(hits);

  if (isShown < totalHits || isShown < 40) {
    Notify.success(`Hooray! We found ${totalHits} images!`);
  } 
  const lastPage = Math.ceil(totalHits / pixabayApi.PER_PAGE)
  if (pixabayApi.page === lastPage) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    observer.unobserve(scroll);
  }
}


function onGetGallery(elements) {
  const markup = elements
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
    <a href="${largeImageURL}">
      <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
    </div>`;
      }
    )
    .join('');
  galleryWrapper.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}