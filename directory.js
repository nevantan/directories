class Directory {
  /**
   * Represents a directory in the file system
   * @param {string} path - The path to create, the constructor will recurse to create the entire path
   */
  constructor(path) {
    const [name, ...rest] = path.split('/');
    this._name = name;

    this._children = [];

    if (rest.length > 0) this._create(rest.join('/'));
  }

  /**
   * Runs a command on the given directory
   * @param {string} input - The command line to run, including arguments
   */
  run(input) {
    // Output the command that we're about to run
    console.log(input);

    try {
      // Parse the command
      const [cmd, ...argv] = input.split(' ');
      switch (cmd) {
        case 'CREATE':
          this._create(argv[0]);
          break;
        case 'LIST':
          // If this folder has a blank name, don't print
          this._list(this._name ? 0 : -1);
          break;
        case 'MOVE':
          this._move(argv[0], argv[1]);
          break;
        case 'DELETE':
          this._delete(argv[0], argv[0]);
          break;
        default:
          console.log('Unknown command:', cmd);
      }
    } catch (e) {
      console.error(e.message);
    }
  }

  /**
   * Add a child to the directory
   * @param {Directory} dir - The directory to add as a child
   */
  addChild(dir) {
    this._children = [...this._children, dir];
  }

  get name() {
    return this._name;
  }

  /**
   * Creates a directory at the given path, traversing as needed
   * @param {string} path - The directory path to create
   */
  _create(path) {
    // Split the path so we can work with individual components
    const [name, ...rest] = path.split('/');

    // If there is already a child directory with the requested name
    const existing = this._children.find((dir) => dir.name === name);
    if (existing) {
      // Add the rest of the path to the existing child
      existing._create(rest.join('/'));
    } else {
      // Else, make a new child directory
      this._children = [...this._children, new Directory(path)];
    }
  }

  /**
   * Pretty prints the current directory's structure including children, recursively
   * @param {level} int - The indent level to print the current directory name with
   */
  _list(level = 0) {
    // If this level isn't hidden
    if (level >= 0) {
      // Add indentation to the folder name and print
      let output = this._name;
      for (let i = 0; i < level; i++) {
        output = '  ' + output;
      }
      console.log(output);
    }

    // Loop through children and print their output
    this._sortChildren();
    this._children.forEach((dir) => dir._list(level + 1));
  }

  /**
   * Move a target directory to a new path
   * @param {string} targetPath - The path of the directory that is to be moved
   * @param {string} destPath - The new parent of the target directory
   */
  _move(targetPath, destPath) {
    const target = this._pick(targetPath);
    this._place(destPath, target);
  }

  /**
   * Traverse the file tree to find a specific directory by path, remove it from the tree, and return it
   * @param {string} path - The path of the directory to retreive from the file tree
   * @returns {Directory}
   */
  _pick(path) {
    const [name, ...rest] = path.split('/');

    // If we're at the end of the path
    if (rest.length === 0) {
      // Remove the target from children, and return it

      // Save the target
      const target = this._children.find((dir) => dir.name === name);

      // Remove the child
      this._children = this._children.filter((dir) => dir.name !== name);

      // Return the target
      return target;
    }

    // Else, traverse down the tree
    const next = this._children.find((dir) => dir.name === name);
    return next._pick(rest.join('/'));
  }

  /**
   * Place the provided directory at a given path
   * @param {string} path - The path of the new parent of the provided directory
   * @param {Directory} dir - The directory to place at a new path
   */
  _place(path, dir) {
    const [name, ...rest] = path.split('/');

    // If we're at the end of the destination path
    if (rest.length === 0) {
      // Add the provided directory to the correct child
      const parent = this._children.find((dir) => dir.name === name);
      parent.addChild(dir);
    } else {
      // Else, traverse down the directory structure
      const next = this._children.find((dir) => dir.name === name);
      next._place(rest.join('/'), dir);
    }
  }

  /**
   * Deletes the directory at the given path
   * @param {string} path - The path to delete
   * @param {string} fullPath - The original path for display purposes
   */
  _delete(path, fullPath = '') {
    const [name, ...rest] = path.split('/');

    // If we're at the end of the path
    if (rest.length === 0) {
      // Remove the child with the given name
      this._children = this._children.filter((dir) => dir._name !== name);
    } else {
      // Else, pass this command to the next child in line
      const subject = this._children.find((dir) => dir._name === name);

      if (!subject)
        throw new Error(
          `Cannot delete ${fullPath ? fullPath : path} - ${name} does not exist`
        );

      subject._delete(rest.join('/'), fullPath);
    }
  }

  /**
   * Sort the children of this directory in alphabetical order
   */
  _sortChildren() {
    this._children = [...this._children].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
}

module.exports = Directory;
