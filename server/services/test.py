# viết chương trình python để kiểm tra xem một số có phải là số nguyên tố hay không

def is_prime(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True


print(is_prime(2))
print(is_prime(3))