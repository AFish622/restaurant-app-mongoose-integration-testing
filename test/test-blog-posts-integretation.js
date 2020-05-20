const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const expect = chai.expect;

const { BlogPost } = require('../models')
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config')

chai.use(chaiHttp);

function seedBlogData() {
    console.info('Seeding blog data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateBlogData());
    }

    return BlogPost.insertMany(seedData);
};

function generateBlogData() {
    return {
        title: faker.title(),
        content: faker.content(),
        author: {
            firstName: faker.firstName(),
            lastName: faker.lastName()
        }
    };
};

function tearDownDB() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Blog-post API resource', function() {
    
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedBlogData();
    });

    afterEach(function() {
        return tearDownDB();
    });

    after(function() {
        return closeServer()
    });

})

describe('GET Endpoint', function() {
    let res;
    it('should return all blog post', function() {
        return chai.request(app)
                        .get('/posts')
                        .then(function(_res) {
                            res = _res;
                            expect(res).to.have.status(200);
                            expect(res.body.post).to.have.lengthOf.at.least(1);
                            return BlogPost.count();
                        })
                        .then(function(res) {
                            expect(res.body.post).to.have.lengthOf(count);
                        });

    });
});

describe('POST endpoint', function() {
    // make fake data to send
    // send data in a post 
    // check the response
    // check the DB matches the post 
    // close DB

    const newPost = generateBlogData();

    it('should add post to blog', function() {
        return chai.request(app)
                .post('/posts')
                .send(newPost)
                .then(function(res) {
                    expect(res).to.be(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.include.kets('title', 'content', 'author');
                    expect(res.body.title).to.not.be.null;
                    expect(res.body.title).to.equal(newPost.title);
                    expect(res.body.content).to.equal(newPost.title);
                    return BlogPost.findById(res.body.id);
                })
                .then(function(post) {
                    expect(post.title).to.equal(newPost.title);
                    expect(post.content).to.equal(newPost.content);
                    expect(post.author).to.equal(newPost.author);
                })
    })
})

describe('PUT endpoint', function() {
    // get Id of post to update
    // make updates to post
    // send post back
    // check status
    // check the id of that post and content matches
    const updatedPost = {
        title: 'Some New Title',
        content: 'Austin was here'
    }


    it('should update post on PUT', function() {
        return BlogPost.findOne()
                        .then(function(post) {
                            updatedPost.id = post.id;
                            return chai.request(app)
                            .put(`/posts/${updatedPost.id}`)
                            .send(updatedPost)                           
                        })
                        .then(function(res) {
                            expect(res).to.have.status(204);

                            return BlogPost.findById(updatedPost.id)
                        })
                        then(function(post) {
                            expect(post.title).to.equal(updatedPost.title);
                            expect(post.content).to.equal(updatedPost.content);
                        });
    });
});

describe('DELETE endpoint', function() {
    //get the id of one to delete
    //removeById
    // confirm it is deleted from the DB

    it('Should delete posts', function() {
        let blogPost;

        return BlogPost.findOne()
                        .then(function(post) {
                            blogPost = post;
                            return chai.request(app).delete(`/posts${blogPost.id}`);
                        })
                        .then(function(res) {
                            expect(res).to.have.status(204);
                            return BlogPost.findById(blogPost.id);
                        })
                        .then(function(post) {
                            expect(post).to.be.null;
                        })
    })  
})