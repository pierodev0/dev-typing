import type { SnippetsMap } from '@/types';

export const REPO_DATA: SnippetsMap = {
  js: {
    name: 'JavaScript',
    icon: 'fa-js',
    color: 'text-yellow-400',
    code: `const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Usage example
const log = debounce(console.log, 300);
log('Hello'); // Cancelled
log('World'); // Executed`,
  },
  py: {
    name: 'Python',
    icon: 'fa-python',
    color: 'text-blue-400',
    code: `class NeuralNetwork:
    def __init__(self, x, y):
        self.input = x
        self.weights1 = np.random.rand(self.input.shape[1], 4) 
        self.weights2 = np.random.rand(4, 1)                 
        self.y = y
        self.output = np.zeros(self.y.shape)

    def feedforward(self):
        self.layer1 = sigmoid(np.dot(self.input, self.weights1))
        return self.layer1`,
  },
  cpp: {
    name: 'C++',
    icon: 'fa-microchip',
    color: 'text-blue-600',
    code: `template <typename T>
class Matrix {
private:
    std::vector<std::vector<T>> mat;
    unsigned rows;
    unsigned cols;

public:
    Matrix(unsigned _rows, unsigned _cols, const T& _initial);
    Matrix<T>& operator=(const Matrix<T>& rhs);
    
    // Matrix Addition
    Matrix<T> operator+(const Matrix<T>& rhs) {
        Matrix result(rows, cols, 0.0);
        for (unsigned i=0; i<rows; i++) {
            for (unsigned j=0; j<cols; j++) {
                result[i][j] = this->mat[i][j] + rhs(i,j);
            }
        }
        return result;
    }
};`,
  },
  ts: {
    name: 'TypeScript',
    icon: 'fa-js',
    color: 'text-blue-500',
    code: `interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
}

const user = await fetchUser(1);
console.log(user.name);`,
  },
  rust: {
    name: 'Rust',
    icon: 'fa-rust',
    color: 'text-orange-500',
    code: `fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    
    let sum: i32 = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| x * x)
        .sum();
    
    println!("Sum of squared evens: {}", sum);
}

struct Point {
    x: f64,
    y: f64,
}

impl Point {
    fn distance(&self, other: &Point) -> f64 {
        ((self.x - other.x).powi(2) + 
         (self.y - other.y).powi(2)).sqrt()
    }
}`,
  },
};
