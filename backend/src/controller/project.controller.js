import Project from '../models/Project.js';
import Chat from '../models/Chat.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.userId });
    
    // Also get chat counts for each project
    const projectWithCounts = await Promise.all(projects.map(async (project) => {
      const count = await Chat.countDocuments({ projectId: project._id });
      return { ...project._doc, count };
    }));

    res.json({ success: true, projects: projectWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, color, icon, category } = req.body;
    const project = await Project.create({
      name,
      userId: req.user.userId,
      color: color || 'blue',
      icon: icon || 'Folder',
      category: category || 'General'
    });
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    
    // Unlink chats (don't delete them, just set projectId to null)
    await Chat.updateMany({ projectId: req.params.id }, { projectId: null });
    
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
