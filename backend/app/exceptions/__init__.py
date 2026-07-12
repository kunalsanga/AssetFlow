class AssetFlowException(Exception):
    """Base exception for all custom AssetFlow errors"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class DashboardException(AssetFlowException):
    """Base exception for Dashboard errors"""
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message=message, status_code=status_code)

class DashboardLoadError(DashboardException):
    """Exception raised when the dashboard fails to load"""
    def __init__(self, detail: str = "Dashboard could not be loaded.", status_code: int = 500):
        super().__init__(message=detail, status_code=status_code)

class CircularHierarchyException(AssetFlowException):
    """Exception raised when circular hierarchy is detected in departments"""
    def __init__(self, message: str = "Circular hierarchy detected."):
        super().__init__(message=message, status_code=400)

class DuplicateResourceException(AssetFlowException):
    """Exception raised when a duplicate resource (like name or code) is created"""
    def __init__(self, message: str):
        super().__init__(message=message, status_code=400)

class DepartmentHeadAssignmentException(AssetFlowException):
    """Exception raised when head assignment rules are violated"""
    def __init__(self, message: str):
        super().__init__(message=message, status_code=400)

class UserRoleModificationException(AssetFlowException):
    """Exception raised when role modifications are unauthorized or self-promoting"""
    def __init__(self, message: str):
        super().__init__(message=message, status_code=403)

class ResourceNotFoundException(AssetFlowException):
    """Exception raised when a requested resource is not found"""
    def __init__(self, message: str = "Resource not found."):
        super().__init__(message=message, status_code=404)
