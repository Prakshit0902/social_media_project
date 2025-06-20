import { faker } from '@faker-js/faker';

export const getRandomElements = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};

export const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const generateHashtags = (count = 3) => {
  const hashtags = [];
  for (let i = 0; i < count; i++) {
    hashtags.push(faker.word.noun().toLowerCase());
  }
  return hashtags;
};

export const generateMediaUrls = (type, count = 1) => {
  const urls = [];
  for (let i = 0; i < count; i++) {
    if (type === 'image') {
      urls.push({
        url: faker.image.urlPicsumPhotos({ width: 1080, height: 1080 }),
        type: 'image'
      });
    } else if (type === 'video') {
      urls.push({
        url: `https://example.com/videos/${faker.string.uuid()}.mp4`,
        type: 'video'
      });
    }
  }
  return urls;
};