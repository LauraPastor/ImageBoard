(function() {
    Vue.component('image-modal', {
        data: function() {
            return {
                heading: 'funky chicken',
                imageData: '',
                comments: [],
                tags: [],
                commentToUpload: {},
                buttondisabled: false
            };
        },
        //compenent should NOT change its prop. Ok to change data.
        props: ['id'],
        template: '#modal',
        mounted: function() {
            this.getImage();
            this.$emit('removetag');
        },
        watch: {
            id: function() {
                this.getImage();
            }
        },
        methods: {
            deleteimage: function(){
                var me = this;
                axios.post('/delete/' + this.id)
                    .then(function() {
                        location.hash = '';
                        me.$emit('deleted');
                    }).catch(function(err) {console.log(err);});
            },
            tagclick: function(tagclick) {
                let tag = tagclick.tag.trim();
                var self = this;
                axios.get('/imagesbytag/' + tag)
                    .then(function(response) {
                        var newimages = response.data;
                        console.log(tag);
                        self.$emit('changed', newimages, tag);
                        self.$emit('close');
                    }).catch(function(err) {console.log(err);});
            },
            getImage: function() {
                var self = this;
                axios.get('/modal/' + this.id)
                    .then(function(response) {
                        if (response.data.length === 0 || response.data == "error") {
                            self.$emit('close');
                        }
                        self.imageData = response.data;
                    }).catch(function(err) {
                        console.log(err);
                        self.$emit('close');
                    });
                axios.get('/comments/' + this.id)
                    .then(function(response) {
                        self.comments = response.data;
                    }).catch(function(err) {console.log(err);});
                axios.get('/tags/' + this.id)
                    .then(function(response) {
                        self.tags = response.data;
                    }).catch(function(err) {console.log(err);});
                },
            commentupload: function() {
                this.buttondisabled = true;
                this.commentToUpload.image_id = this.id;
                var me = this;
                axios.post('/comments', this.commentToUpload)
                    .then(function(response) {
                        me.buttondisabled = false;
                        me.comments.unshift(response.data[0]);
                        me.commentToUpload.comment = '';
                        me.commentToUpload.user = '';
                    });
            },
            close: function(){
                this.$emit('close');
            }
        }
    });

    new Vue({
        el: '#main',
        data: {
            imageId: location.hash.slice(1),
            heading: 'My Vue App',
            greetee: 'World',
            className: 'funky',
            images: [],
            lastImage: 1,
            latestImage: 0,
            pagecount: 0,
            imageToUpload: {},
            file: '',
            newimage: false,
            clickedontag: false,
            buttondisabled: false
        },
        mounted: function() {
            this.initialise();
            var self = this;
            axios.get('latestimage')
                .then(function(response) {
                    self.latestImage = response.data[0].id;
                    window.setInterval(function(){
                        var me = self;
                        axios.get('latestimage')
                            .then(function(response) {
                                if (self.latestImage != response.data[0].id) {
                                    me.newimage = true;
                                }
                            }).catch(function(err) {console.log(err);});
                    }, 5000);
                }).catch(function(err) {console.log(err);});
        },
        methods: {
            initialise: function() {
                var self = this;
                addEventListener('hashchange', function() {
                    self.imageId = location.hash.slice(1);
                });
                axios.get('/images')
                    .then(function(response) {
                        self.images = response.data;
                        self.latestImage = response.data[0].id;
                    }).catch(function(err) {console.log(err);});
            },
            updateimages: function(newimages) {
                this.images = newimages;

            },
            nextimages: function() {
                this.pagecount ++;
                var self = this;
                axios.get('/moreimages/' + this.images[this.images.length - 1].id)
                    .then(function(response) {
                        self.images = response.data;
                    }).catch(function(err) {console.log(err);});
                axios.get('lastimage')
                    .then(function(response) {
                        self.lastImage = response.data[0].id;
                    }).catch(function(err) {console.log(err);});
            },
            previousimages: function() {
                this.pagecount --;
                var self = this;
                axios.get('/previmages/' + this.images[0].id)
                    .then(function(response) {
                        self.images = response.data;
                    }).catch(function(err) {console.log(err);});
            },
            modalpopup: function(id) {
                this.imageId = id;
                this.clickedontag = false;
            },
            closeModal: function() {
                this.imageId = null;
                location.hash = '';
            },
            resettag: function() {
                this.clickedontag = false;
            },
            handleFileChange: function(e) {
                this.file = e.target.files[0];
            },
            upload: function() {
                this.buttondisabled = true;

                var formData = new FormData;
                formData.append('file', this.file);
                formData.append('title', this.imageToUpload.title);
                formData.append('desc', this.imageToUpload.desc);
                formData.append('user', this.imageToUpload.user);
                var me = this;
                axios.post('/upload', formData)
                    .then(function(response) {
                        me.images.unshift(response.data[0]);
                        me.imageToUpload.title = '';
                        me.imageToUpload.desc = '';
                        me.imageToUpload.user = '';
                        me.buttondisabled = false;
                        const input = me.$refs.fileInput;
                        input.type = 'text';
                        input.type = 'file';
                        axios.get('latestimage')
                            .then(function(response) {
                                me.latestImage = response.data[0].id;
                            }).catch(function(err) {console.log(err);});

                        }).catch(function(err) {console.log(err);});
                }
            }
        });
      }());
