import batchesData from '@/services/mockData/batches.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let batches = [...batchesData];

export const batchService = {
  async getAll() {
    await delay(300);
    return [...batches];
  },

  async getById(id) {
    await delay(200);
    const batch = batches.find(b => b.Id === parseInt(id, 10));
    if (!batch) {
      throw new Error('Batch not found');
    }
    return { ...batch };
  },

  async create(batchData) {
    await delay(400);
    const newBatch = {
      Id: Math.max(...batches.map(b => b.Id), 0) + 1,
      ...batchData,
      enrolledCount: 0
    };
    batches.push(newBatch);
    return { ...newBatch };
  },

  async update(id, batchData) {
    await delay(300);
    const index = batches.findIndex(b => b.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Batch not found');
    }
    const updatedBatch = {
      ...batches[index],
      ...batchData,
      Id: batches[index].Id // Prevent Id modification
    };
    batches[index] = updatedBatch;
    return { ...updatedBatch };
  },

  async delete(id) {
    await delay(300);
    const index = batches.findIndex(b => b.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Batch not found');
    }
    batches.splice(index, 1);
    return { success: true };
  },

  async getByTeacher(teacherId) {
    await delay(200);
    const teacherBatches = batches.filter(b => 
      b.teacherId === parseInt(teacherId, 10)
    );
    return [...teacherBatches];
  },

async updateEnrollment(id, enrolledCount) {
    await delay(200);
    const index = batches.findIndex(b => b.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Batch not found');
    }
    batches[index].enrolledCount = enrolledCount;
    return { ...batches[index] };
  },

  async searchBatches(query) {
    await delay(200);
    const lowerQuery = query.toLowerCase();
    const filtered = batches.filter(b =>
      b.name.toLowerCase().includes(lowerQuery) ||
      b.subject.toLowerCase().includes(lowerQuery) ||
      b.room.toLowerCase().includes(lowerQuery)
    );
    return [...filtered];
  }
};
export default batchService;