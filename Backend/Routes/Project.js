const express = require('express');
const Project = require('../Models/Project');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/projects';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images only (jpeg, jpg, png, gif)!');
        }
    }
});

// Socket.io initialization
function initProjectSocket(io) {
    const projectIo = io.of('/projects');
    projectIo.on('connection', (socket) => {
        console.log('Client connected to project namespace');

        socket.on('disconnect', () => {
            console.log('Client disconnected from project namespace');
        });
    });
    return projectIo;
}

// GET all projects
router.get('/allprojects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create project
router.post('/newproject', 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'galleryImages', maxCount: 10 }
    ]), 
    async (req, res) => {
        try {
            const { title, description, category, client, location, startDate, endDate, status } = req.body;
            
            const thumbnailPath = req.files['thumbnail'] ? 
                '/uploads/projects/' + req.files['thumbnail'][0].filename : null;
            
            const galleryPaths = req.files['galleryImages'] ? 
                req.files['galleryImages'].map(file => '/uploads/projects/' + file.filename) : [];

            const project = new Project({
                title,
                description,
                category,
                client,
                location,
                startDate,
                endDate: endDate || null,
                status,
                thumbnail: thumbnailPath,
                galleryImages: galleryPaths
            });

            const newProject = await project.save();
            req.app.get('io').of('/projects').emit('NEW_PROJECT', newProject);
            res.status(201).json(newProject);
        } catch (error) {
            if (req.files) {
                Object.values(req.files).forEach(files => {
                    files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                });
            }
            res.status(400).json({ message: error.message });
        }
    }
);

// PUT update project
router.put('/:id', 
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'galleryImages', maxCount: 10 }
    ]), 
    async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);
            if (!project) return res.status(404).json({ message: 'Project not found' });

            const { title, description, category, client, location, startDate, endDate, status } = req.body;
            
            project.title = title;
            project.description = description;
            project.category = category;
            project.client = client;
            project.location = location;
            project.startDate = startDate;
            project.endDate = endDate || null;
            project.status = status;
            project.updatedAt = Date.now();

            if (req.files['thumbnail']) {
                if (project.thumbnail) {
                    const oldPath = path.join('public', project.thumbnail);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                project.thumbnail = '/uploads/projects/' + req.files['thumbnail'][0].filename;
            }

            if (req.files['galleryImages']) {
                project.galleryImages.forEach(image => {
                    const oldPath = path.join('public', image);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                });
                project.galleryImages = req.files['galleryImages'].map(file => 
                    '/uploads/projects/' + file.filename
                );
            }

            const updatedProject = await project.save();
            req.app.get('io').of('/projects').emit('UPDATE_PROJECT', updatedProject);
            res.json(updatedProject);
        } catch (error) {
            if (req.files) {
                Object.values(req.files).forEach(files => {
                    files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                });
            }
            res.status(400).json({ message: error.message });
        }
    }
);

// DELETE project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (project.thumbnail) {
            const thumbPath = path.join('public', project.thumbnail);
            if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
        }

        project.galleryImages.forEach(image => {
            const imagePath = path.join('public', image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        });

        req.app.get('io').of('/projects').emit('DELETE_PROJECT', { projectId: req.params.id });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = { router, initProjectSocket };