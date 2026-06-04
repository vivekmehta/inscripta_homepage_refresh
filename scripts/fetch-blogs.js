'use strict';

// Fetch the latest blog posts from blog.inscripta.ai (WordPress REST API)
// and write them to src/data/blogs.json. The Pug build reads that file and
// renders the carousel from it, so `npm start` always picks up new posts.
//
// On network failure we keep the existing cached blogs.json so the build
// never breaks.

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FEED_URL = 'https://blog.inscripta.ai/wp-json/wp/v2/posts?per_page=8&_embed';
const OUT_PATH = path.resolve(__dirname, '../src/data/blogs.json');
const TIMEOUT_MS = 15000;

function decodeEntities(s) {
    if (!s) return '';
    return String(s)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#8216;|&#8217;|&#8242;|&apos;/g, "'")
        .replace(/&#8220;|&#8221;|&#8243;/g, '"')
        .replace(/&#8211;/g, '–')
        .replace(/&#8212;/g, '—')
        .replace(/&hellip;|&#8230;/g, '…')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function pickImage(media) {
    if (!media) return '';
    const sizes = media.media_details && media.media_details.sizes;
    if (sizes) {
        const preferred = ['medium_large', 'large', 'medium', 'full', 'thumbnail'];
        for (const key of preferred) {
            if (sizes[key] && sizes[key].source_url) return sizes[key].source_url;
        }
    }
    return media.source_url || '';
}

async function main() {
    try {
        console.log(`### INFO: Fetching latest blogs from ${FEED_URL}`);
        const { data } = await axios.get(FEED_URL, { timeout: TIMEOUT_MS });
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Empty or non-array response from WordPress');
        }

        const blogs = data.map(post => {
            const media = post._embedded
                && post._embedded['wp:featuredmedia']
                && post._embedded['wp:featuredmedia'][0];
            return {
                title: decodeEntities(post.title && post.title.rendered),
                url: post.link,
                image: pickImage(media),
                date: post.date
            };
        }).filter(b => b.url && b.title);

        const dir = path.dirname(OUT_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(OUT_PATH, JSON.stringify(blogs, null, 2) + '\n');
        console.log(`### INFO: Wrote ${blogs.length} blogs to ${OUT_PATH}`);
    } catch (err) {
        const msg = (err && err.message) || String(err);
        console.warn(`### WARN: Could not fetch blogs (${msg}).`);
        if (fs.existsSync(OUT_PATH)) {
            console.warn(`### WARN: Using existing cached blogs at ${OUT_PATH}`);
        } else {
            const dir = path.dirname(OUT_PATH);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(OUT_PATH, '[]\n');
            console.warn(`### WARN: No cache found; wrote empty blogs.json so build does not crash`);
        }
    }
}

main();
