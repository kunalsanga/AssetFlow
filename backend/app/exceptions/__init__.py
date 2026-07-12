class DashboardException(Exception):
    """Base exception for Dashboard errors"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class DashboardLoadError(DashboardException):
    """Exception raised when the dashboard fails to load"""
    def __init__(self, detail: str = "Dashboard could not be loaded.", status_code: int = 500):
        super().__init__(message=detail, status_code=status_code)
