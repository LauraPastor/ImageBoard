const spicedPg = require('spiced-pg');
let secrets;
if (process.env.NODE_ENV === 'production') {
    secrets = process.env;
} else {
    secrets = require('./secrets');
}

const dbUrl = process.env.DATABASE_URL || `postgres:${secrets.dbUser}:${secrets.dbPassword}@localhost:5432/imageboard`;
const db = spicedPg(dbUrl);



exports.getCommentsById = function(image_id) {
    const q = `SELECT * FROM comments WHERE image_id = $1`;
    const params = [image_id || null];
    return db.query(q, params);
};

exports.addComment = function(comment, username, image_id) {
    const q = `INSERT INTO comments (comment, username, image_id)
    VALUES ($1, $2, $3) RETURNING *`;
    const params = [comment || null, username || null, image_id || null];
    return db.query(q, params);
};


exports.getImages = function() {
    return db.query(`
        SELECT * FROM images
        ORDER BY id DESC
        LIMIT 12`
    );
};

exports.lastImage = function() {
    return db.query(`SELECT id FROM images ORDER BY id ASC LIMIT 1`);
};

exports.latestImage = function() {
    return db.query(`SELECT id FROM images ORDER BY id DESC LIMIT 1`);
};

exports.getMoreImages = function(id) {
    const q = `
        SELECT * FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 12`;
    const params = [id || null];
    return db.query(q, params);
};

exports.getPrevImages = function(id) {
    const q = `
        SELECT * FROM images
        WHERE id > $1
        LIMIT 12
        `;
    const params = [id || null];
    return db.query(q, params);
};

exports.getImageById = function(id) {
    const q = `
        SELECT *,(
            SELECT id FROM images
            WHERE id > $1
            LIMIT 1
        ) AS next,(
            SELECT id FROM images
            WHERE id < $1
            ORDER BY id DESC
            LIMIT 1
        ) AS prev
        FROM images
        WHERE id = $1
    `;
    const params = [id || null];
    return db.query(q, params);
};

exports.deleteImage = function(id) {
    const q1 = `DELETE FROM images WHERE id = $1 RETURNING *`;
    const q2 = `DELETE FROM comments WHERE image_id = $1`;
    
    const params1 = [id || null];

    return Promise.all([
        db.query(q1, params1),
        db.query(q2, params1),
        db.query(q3, params1),
    ]);
};

exports.addImage = function(title, description, username, url) {
    const q = `
        INSERT INTO images (title, description, username, url)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const params = [title || null, description || null, username || null, url];
    return db.query(q, params);
};
