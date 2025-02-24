interface User {
    id: string;
    name: string;
    email: string;
}

class UserService {
    private users: User[] = [];

    // Create a new user
    createUser(name: string, email: string): User {
        const newUser: User = {
            id: this.generateId(),
            name,
            email
        };
        this.users.push(newUser);
        return newUser;
    }

    // Get a user by ID
    getUserById(id: string): User | undefined {
        return this.users.find(user => user.id === id);
    }

    // Update a user by ID
    updateUser(id: string, name: string, email: string): User | undefined {
        const user = this.getUserById(id);
        if (user) {
            user.name = name;
            user.email = email;
        }
        return user;
    }

    // Delete a user by ID
    deleteUser(id: string): boolean {
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }

    // Generate a unique ID for a new user
    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

export default UserService;
