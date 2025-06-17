const express = require('express');
const multer = require('multer');
const path = require('path');
const Blog = require('../Models/Blog');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// WebSocket setup function remains the same
const setupWebSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected to blog updates');
        
        socket.on('join-blog', (blogId) => {
            socket.join(`blog-${blogId}`);
            console.log(`Client joined blog room: ${blogId}`);
        });
        
        socket.on('leave-blog', (blogId) => {
            socket.leave(`blog-${blogId}`);
            console.log(`Client left blog room: ${blogId}`);
        });
        
        socket.on('disconnect', () => {
            console.log('Client disconnected from blog updates');
        });
    });
    
    router.io = io;
};

// Get all blogs
router.get('/allblog', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        // Map through blogs and convert image paths to full URLs
        const blogsWithFullImageUrls = blogs.map(blog => {
          if (blog.images && blog.images.length) {
            const images = blog.images.map(image => {
              return `${req.protocol}://${req.get('host')}/uploads/${image}`;
            });
            return { ...blog._doc, images };
          }
          return blog;
        });
        res.json(blogsWithFullImageUrls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single blog
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
          // Convert image paths to full URLs
          if (blog.images && blog.images.length) {
            const images = blog.images.map(image => {
              return `${req.protocol}://${req.get('host')}/uploads/${image}`;
            });
            blog.images = images;
          }
          res.json(blog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new blog with image upload support
router.post('/newBlog', upload.array('images', 10), async (req, res) => {
    try {
        const imageFiles = req.files ? req.files.map(file => file.filename) : [];
        
        const blog = new Blog({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            images: imageFiles,
            projectType: req.body.projectType,
            location: req.body.location,
            status: req.body.status
        });

        const newBlog = await blog.save();
        
        // Convert image paths to full URLs for the response
        if (newBlog.images && newBlog.images.length) {
          newBlog.images = newBlog.images.map(image => {
            return `${req.protocol}://${req.get('host')}/uploads/${image}`;
          });
        }
        
        if (router.io) {
            router.io.emit('blog-created', {
                id: newBlog._id,
                title: newBlog.title,
                author: newBlog.author,
                createdAt: newBlog.createdAt,
                message: 'New construction blog post published!'
            });
        }
        
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update blog with image upload support
router.patch('/:id', upload.array('images', 10), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            const oldTitle = blog.title;
            
            // Handle new image uploads
            if (req.files && req.files.length) {
                const newImages = req.files.map(file => file.filename);
                blog.images = [...blog.images, ...newImages];
            }
            
            // Update other fields
            blog.title = req.body.title || blog.title;
            blog.content = req.body.content || blog.content;
            blog.author = req.body.author || blog.author;
            blog.projectType = req.body.projectType || blog.projectType;
            blog.location = req.body.location || blog.location;
            blog.status = req.body.status || blog.status;
            
            const updatedBlog = await blog.save();
            
            // Convert image paths to full URLs for the response
            if (updatedBlog.images && updatedBlog.images.length) {
              updatedBlog.images = updatedBlog.images.map(image => {
                return `${req.protocol}://${req.get('host')}/uploads/${image}`;
              });
            }
            
            if (router.io) {
                router.io.to(`blog-${req.params.id}`).emit('blog-updated', {
                    id: updatedBlog._id,
                    title: updatedBlog.title,
                    oldTitle: oldTitle,
                    updatedAt: updatedBlog.updatedAt,
                    message: 'Blog post has been updated'
                });
                
                router.io.emit('blog-list-updated', {
                    action: 'updated',
                    blog: updatedBlog
                });
            }
            
            res.json(updatedBlog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete blog
router.delete('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            await blog.deleteOne();
            
            if (router.io) {
                router.io.emit('blog-deleted', {
                    id: req.params.id,
                    title: blog.title,
                    message: 'Blog post has been deleted'
                });
            }
            
            res.json({ message: 'Blog deleted' });
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add progress update with image upload support
router.post('/:id/progress', upload.array('images', 10), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            const imageFiles = req.files ? req.files.map(file => file.filename) : [];
            
            const progressUpdate = {
                update: req.body.update,
                timestamp: new Date(),
                images: imageFiles
            };
            
            blog.content += `\n\n**Progress Update (${progressUpdate.timestamp.toLocaleDateString()}):** ${progressUpdate.update}`;
            
            if (imageFiles.length) {
                blog.images = [...blog.images, ...imageFiles];
            }
            
            const updatedBlog = await blog.save();
            
            // Convert image paths to full URLs for the response
            if (updatedBlog.images && updatedBlog.images.length) {
              updatedBlog.images = updatedBlog.images.map(image => {
                return `${req.protocol}://${req.get('host')}/uploads/${image}`;
              });
            }
            
            if (router.io) {
                router.io.to(`blog-${req.params.id}`).emit('progress-update', {
                    blogId: req.params.id,
                    title: blog.title,
                    update: progressUpdate.update,
                    timestamp: progressUpdate.timestamp,
                    images: progressUpdate.images.map(img => 
                      `${req.protocol}://${req.get('host')}/uploads/${img}`
                    ),
                    message: 'Construction progress updated!'
                });
            }
            
            res.json(updatedBlog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = { router, setupWebSocket };