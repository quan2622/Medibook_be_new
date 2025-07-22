module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('Users', 'image', {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      }, { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('Users', 'image', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });
    });
  }
};
