DROP TABLE IF EXISTS comments;

CREATE TABLE comments (
    id SERIAL PRIMARY key,
    comment VARCHAR(500) NOT NULL,
    username VARCHAR(50) NOT NULL,
    image_id INT NOT NULL ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REFERENCES images(id)

INSERT INTO comments (comment, username, image_id) VALUES (
    'This is a really great comment. Could not be better. I love writing comments',
    'funkychicken',
    1
);

INSERT INTO comments (comment, username, image_id) VALUES (
    'Short Comment.',
    'otheruser',
    1
);

INSERT INTO comments (comment, username, image_id) VALUES (
    'This is a really long comment to see how it looks. Check this out. This is a really great comment. Could not be better. I love writing comments',
    'funkychicken',
    1
);

INSERT INTO comments (comment, username, image_id) VALUES (
    'This is a really great comment. Could not be better. I love writing comments',
    'USER',
    1
);
