const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');

router.get('/', async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, code, dean, budget, numDepartments } = req.body;
    
    const faculty = new Faculty({
      name: name || 'New Faculty',
      code: code?.toUpperCase(),
      dean,
      budget: budget || 0,
      numDepartments: numDepartments || 0,
    });
    
    const saved = await faculty.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, code, dean, budget, numDepartments, isActive } = req.body;

    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { name, code, dean, budget, numDepartments, isActive },
      { new: true, runValidators: true }
    );

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json({ message: 'Faculty deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
