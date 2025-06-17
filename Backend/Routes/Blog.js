const express = require('express');
const Blog = require('../Models/Blog');

const router = express.Router();

// WebSocket setup function - call this from your main server file
const setupWebSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected to blog updates');
        
        // Join blog-specific rooms
        socket.on('join-blog', (blogId) => {
            socket.join(`blog-${blogId}`);
            console.log(`Client joined blog room: ${blogId}`);
        });
        
        // Leave blog-specific rooms
        socket.on('leave-blog', (blogId) => {
            socket.leave(`blog-${blogId}`);
            console.log(`Client left blog room: ${blogId}`);
        });
        
        socket.on('disconnect', () => {
            console.log('Client disconnected from blog updates');
        });
    });
    
    // Store io instance for use in routes
    router.io = io;
};

// Get all blogs
router.get('/allblog', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single blog
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            res.json(blog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new blog
router.post('/newBlog', async (req, res) => {
    const blog = new Blog({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        images: req.body.images || []
    });

    try {
        const newBlog = await blog.save();
        
        // Emit new blog creation to all connected clients
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

// Update blog
router.patch('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            const oldTitle = blog.title;
            Object.assign(blog, req.body);
            const updatedBlog = await blog.save();
            
            // Emit blog update to clients in the specific blog room
            if (router.io) {
                router.io.to(`blog-${req.params.id}`).emit('blog-updated', {
                    id: updatedBlog._id,
                    title: updatedBlog.title,
                    oldTitle: oldTitle,
                    updatedAt: updatedBlog.updatedAt,
                    message: 'Blog post has been updated'
                });
                
                // Also emit to general room for blog list updates
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
            
            // Emit blog deletion to all connected clients
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

// Add progress update endpoint for construction blogs
router.post('/:id/progress', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            const progressUpdate = {
                update: req.body.update,
                timestamp: new Date(),
                images: req.body.images || []
            };
            
            // Add progress update to blog content or create a progress field
            blog.content += `\n\n**Progress Update (${progressUpdate.timestamp.toLocaleDateString()}):** ${progressUpdate.update}`;
            const updatedBlog = await blog.save();
            
            // Emit progress update to clients
            if (router.io) {
                router.io.to(`blog-${req.params.id}`).emit('progress-update', {
                    blogId: req.params.id,
                    title: blog.title,
                    update: progressUpdate.update,
                    timestamp: progressUpdate.timestamp,
                    images: progressUpdate.images,
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