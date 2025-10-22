import { Router } from "express";
import { FamilyMember } from "../schema/family.schema.js";
import { authGuard } from "../middlewares/auth.js";

const router = Router();

// Get all family members for the current user
router.get("/", authGuard, async (req, res) => {
  try {
    const members = await FamilyMember.find({ userId: req.user._id });
    res.json({ data: members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new family member
router.post("/", authGuard, async (req, res) => {
  try {
    // log incoming request for debugging
    console.log('Family create request body:', req.body);
    console.log('Authenticated user id:', req.user && req.user._id);

    const { name, relation, color } = req.body;
    if (!name || !relation || !color) {
      return res.status(400).json({ error: 'name, relation and color are required' });
    }

    const member = new FamilyMember({
      name,
      relation,
      color,
      userId: req.user._id,
    });
    await member.save();
    console.log('Family member saved:', member);
    res.status(201).json({ data: member });
  } catch (error) {
    console.error('Failed to create family member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a family member
router.put("/:id", authGuard, async (req, res) => {
  try {
    const { id } = req.params;
    const member = await FamilyMember.findOne({ _id: id, userId: req.user._id });
    if (!member) {
      return res.status(404).json({ error: "Family member not found" });
    }
    Object.assign(member, req.body);
    await member.save();
    res.json({ data: member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a family member
router.delete("/:id", authGuard, async (req, res) => {
  try {
    const { id } = req.params;
    const member = await FamilyMember.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!member) {
      return res.status(404).json({ error: "Family member not found" });
    }
    res.json({ data: member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific family member
router.get("/:id", authGuard, async (req, res) => {
  try {
    const { id } = req.params;
    const member = await FamilyMember.findOne({ _id: id, userId: req.user._id });
    if (!member) {
      return res.status(404).json({ error: "Family member not found" });
    }
    res.json({ data: member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as familyRouter };